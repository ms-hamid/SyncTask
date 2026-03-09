"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
// import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";


// ============================================================
// Type Definitions
// ============================================================

export interface TeamMemberInput {
  userId: string;
  specialty: string | null;
  role: string;
}

export interface GenerateProjectResult {
  success: boolean;
  projectId?: string;
  projectName?: string;
  tasksCreated?: number;
  error?: string;
}

// ============================================================
// Zod Schema — Output yang diharapkan dari AI
// ============================================================

const TaskSchema = z.object({
  title: z.string().describe("Judul tugas yang singkat dan jelas"),
  description: z
    .string()
    .describe("Deskripsi detail langkah-langkah pengerjaan tugas"),
  effortScore: z
    .number()
    .int()
    .min(1)
    .max(5)
    .describe("Tingkat kesulitan: 1 (sangat mudah) hingga 5 (sangat kompleks)"),
  requiredSpecialty: z
    .string()
    .describe(
      "Keahlian yang dibutuhkan, contoh: 'Frontend', 'Backend', 'UI/UX', 'DevOps', 'QA'"
    ),
  assigneeName: z
    .string()
    .describe("Nama anggota tim (dipilih TEPAT dari daftar Anggota Tim yang Tersedia) yang akan mengerjakan tugas ini"),
});

const ProjectPlanSchema = z.object({
  projectName: z.string().describe("Nama proyek yang diusulkan AI"),
  tasks: z
    .array(TaskSchema)
    .min(3)
    .max(40)
    .describe("Daftar tugas yang dipecah dari deskripsi proyek"),
});

// ============================================================
// Auto-Assign Logic — Fair-Play Workload Enforcer
// ============================================================

/**
 * Mencocokkan setiap tugas ke anggota tim berdasarkan dua kriteria:
 * 1. Kecocokan specialty (requiredSpecialty === member.specialty)
 * 2. Beban kerja terendah (total effortScore yang sudah ditetapkan)
 *
 * Algoritma:
 * - Prioritas utama: anggota dengan specialty yang cocok DAN workload terendah
 * - Fallback: jika tidak ada yang cocok spesialisasinya, pilih siapapun dengan workload terendah
 */
function assignTasksToMembers(
  tasks: z.infer<typeof ProjectPlanSchema>["tasks"],
  teamMembers: TeamMemberInput[]
): { assigneeId: string | null; workload: number }[] {
  // Track workload setiap anggota (total effortScore yang ditugaskan)
  const workloadMap = new Map<string, number>();
  teamMembers.forEach((m) => workloadMap.set(m.userId, 0));

  return tasks.map((task) => {
    if (teamMembers.length === 0) {
      return { assigneeId: null, workload: 0 };
    }

    // AI selects the assignee directly via name -> map to userId
    const assignedMember = teamMembers.find(m => m.userId.toLowerCase() === task.assigneeName.toLowerCase());
    
    // Fallback: Use the old logic if AI fails to pick a correct name
    if (!assignedMember) {
      const specialists = teamMembers.filter(
        (m) =>
          m.specialty?.toLowerCase() === task.requiredSpecialty.toLowerCase()
      );
      const pool = specialists.length > 0 ? specialists : teamMembers;
      const assignedFallback = pool.reduce((lightest, current) => {
        const currentLoad = workloadMap.get(current.userId) ?? 0;
        const lightestLoad = workloadMap.get(lightest.userId) ?? 0;
        return currentLoad < lightestLoad ? current : lightest;
      });
      const newLoad = (workloadMap.get(assignedFallback.userId) ?? 0) + task.effortScore;
      workloadMap.set(assignedFallback.userId, newLoad);
      return { assigneeId: assignedFallback.userId, workload: newLoad };
    }

    // Update workload tracker
    const newLoad = (workloadMap.get(assignedMember.userId) ?? 0) + task.effortScore;
    workloadMap.set(assignedMember.userId, newLoad);

    return { assigneeId: assignedMember.userId, workload: newLoad };
  });
}

// ============================================================
// Main Server Action: generateProjectTasks
// ============================================================

/**
 * AI Scrum Master — Mengubah deskripsi proyek menjadi task plan yang ter-assign.
 *
 * @param prompt       - Deskripsi proyek dari user
 * @param teamId       - ID tim yang akan mengerjakan proyek
 * @param teamMembers  - Daftar anggota tim dengan specialty mereka
 */
export async function generateProjectTasks(
  prompt: string,
  teamId: string,
  teamMembers: TeamMemberInput[]
): Promise<GenerateProjectResult> {
  // --- Validasi input dasar ---
  if (!prompt?.trim()) {
    return { success: false, error: "Deskripsi proyek tidak boleh kosong." };
  }
  if (!teamId?.trim()) {
    return { success: false, error: "Team ID tidak valid." };
  }

  try {
    // -------------------------------------------------------
    // Pre-requisite: Ensure Mock Team and Users exist in DB
    // -------------------------------------------------------
    await prisma.team.upsert({
      where: { id: teamId },
      update: {},
      create: { id: teamId, name: "Demo Team" },
    });

    for (const member of teamMembers) {
      await prisma.user.upsert({
        where: { id: member.userId },
        update: {},
        create: {
          id: member.userId,
          email: `${member.userId.toLowerCase().replace(/\s/g, '')}@demo.com`,
          name: member.userId, // We use userId as name in the mock data
        },
      });

      await prisma.teamMembership.upsert({
        where: {
          userId_teamId: {
            userId: member.userId,
            teamId: teamId,
          },
        },
        update: {
          role: "MEMBER",
          specialty: member.specialty,
        },
        create: {
          userId: member.userId,
          teamId: teamId,
          role: "MEMBER",
          specialty: member.specialty,
        },
      });
    }

    // -------------------------------------------------------
    // Phase 1: AI Generates Project Plan
    // -------------------------------------------------------
    const membersSummary =
      teamMembers.length > 0
        ? teamMembers
            .map(
              (m) =>
                `- User ID: ${m.userId}, Role: ${m.role}, Specialty: ${m.specialty ?? "General"}`
            )
            .join("\n")
        : "Tidak ada anggota tim terdaftar.";

    const { object: projectPlan } = await generateObject({
      // model: anthropic(
      //   (process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest") as string
      // ),
      model: google(
        (process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash") as string
      ),
      schema: ProjectPlanSchema,
      system: `Kamu adalah Tech Lead dan Scrum Master berpengalaman.
Tugasmu adalah memecah deskripsi proyek dari user menjadi tugas-tugas teknis yang terperinci dan actionable.
Untuk setiap tugas, tentukan:
- Tingkat kesulitan (effortScore 1-5, di mana 1=sangat mudah, 5=sangat kompleks)
- Keahlian yang dibutuhkan (requiredSpecialty, pilih dari: Frontend, Backend, UI/UX, DevOps, QA, Mobile, Data)
- Anggota tim yang mengerjakannya (assigneeName). WAJIB pilih SATU NAMA sama persis (case insensitive) dari daftar Anggota Tim yang Tersedia yang paling cocok spesialisasinya.
Pastikan tugas-tugas mencakup seluruh scope proyek: dari setup, implementasi fitur, testing, hingga deployment.
Buatlah daftar tugas yang komprehensif. Usahakan kelompokkan menjadi maksimal 15 sampai 20 tugas utama yang padat dan jelas agar tidak terlalu membebani tim.
Gunakan Bahasa Indonesia untuk title dan description.`,
      prompt: `Deskripsi Proyek:\n"${prompt}"\n\nAnggota Tim yang Tersedia:\n${membersSummary}\n\nPecah proyek ini menjadi tugas-tugas yang spesifik dan dapat dikerjakan.`,
    });

    // -------------------------------------------------------
    // Phase 2: Auto-Assign Tasks (Fair-Play Enforcer)
    // -------------------------------------------------------
    const assignments = assignTasksToMembers(projectPlan.tasks, teamMembers);

    // -------------------------------------------------------
    // Phase 3: Persist to Database via Prisma Transaction
    // -------------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      // 3a. Buat Project baru
      const project = await tx.project.create({
        data: {
          name: projectPlan.projectName,
          description: prompt,
          promptUsed: prompt,
          teamId: teamId,
        },
      });

      // 3b. Buat semua Task sekaligus (bulk create)
      const taskData = projectPlan.tasks.map((task, index) => ({
        title: task.title,
        description: task.description,
        effortScore: task.effortScore,
        status: "TODO" as const,
        order: index,
        projectId: project.id,
        assigneeId: assignments[index]?.assigneeId ?? null,
      }));

      await tx.task.createMany({ data: taskData });

      return {
        projectId: project.id,
        projectName: project.name,
        tasksCount: taskData.length,
      };
    });

    // Refresh halaman agar Server Component membaca data terbaru
    revalidatePath("/");

    return {
      success: true,
      projectId: result.projectId,
      projectName: result.projectName,
      tasksCreated: result.tasksCount,
    };
  } catch (error) {
    // Structured error handling
    console.error("[generateProjectTasks] Error:", error);

    if (error instanceof Error) {
      // AI API error (rate limit, invalid key, dll)
      if (error.message.includes("API key")) {
        return {
          success: false,
          error:
            "API key tidak valid atau tidak ditemukan. Pastikan API KEY sudah diset di .env.",
        };
      }
      if (error.message.includes("rate limit")) {
        return {
          success: false,
          error: "Rate limit API tercapai. Coba lagi dalam beberapa detik.",
        };
      }
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "Terjadi kesalahan tidak terduga. Silakan coba lagi.",
    };
  }
}

// ============================================================
// Phase 5: Update Task Status & Order (Drag & Drop)
// ============================================================
export async function updateTaskStatus(
  taskId: string,
  newStatus: "TODO" | "DOING" | "DONE"
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Update Task Error:", error);
    return { success: false, error: "Gagal memindahkan task." };
  }
}

export async function updateTaskOrder(
  items: { id: string; status: "TODO" | "DOING" | "DONE"; order: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Jalankan urutan query update secara serentak dalam 1 transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.task.update({
          where: { id: item.id },
          data: { status: item.status, order: item.order },
        })
      )
    );

    // revalidatePath("/"); // Dihapus untuk menghindari UI 'blink' karena Optimistic Update sudah menangani dari sisi Client
    return { success: true };
  } catch (error: unknown) {
    console.error("Update Task Order Error:", error);
    return { success: false, error: "Gagal mengatur urutan tugas." };
  }
}
