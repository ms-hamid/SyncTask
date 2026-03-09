"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
// import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";

const SingleTaskSchema = z.object({
  title: z.string().describe("Judul tugas yang singkat dan jelas"),
  description: z.string().describe("Deskripsi detail langkah-langkah pengerjaan tugas"),
  effortScore: z.number().int().min(1).max(5).describe("Tingkat kesulitan: 1 (sangat mudah) hingga 5 (sangat kompleks)"),
  requiredSpecialty: z.string().describe("Keahlian yang dibutuhkan, contoh: 'Frontend', 'Backend', 'UI/UX', 'DevOps', 'QA'"),
  assigneeName: z.string().describe("Nama anggota tim (dipilih TEPAT dari daftar Anggota Tim yang Tersedia) yang akan mengerjakan tugas ini"),
});

const MultiTaskSchema = z.object({
  tasks: z.array(SingleTaskSchema).describe("Daftar tugas yang dipecah dari instruksi user"),
});

export async function generateTasksFromPrompt(
  prompt: string,
  projectId: string
): Promise<{ success: boolean; tasks?: any[]; error?: string }> {
  try {
    // 1. Ambil Project beserta Team dan Anggotanya dari DB
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          select: { order: true }
        },
        team: {
          include: {
            members: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!project) return { success: false, error: "Project tidak ditemukan" };
    if (!project.teamId) return { success: false, error: "Project tidak memiliki tim" };

    // Format member data untuk AI prompt
    const teamMembers = project.team.members;
    const membersSummary = teamMembers.length > 0
      ? teamMembers.map(m => `- Nama: ${m.user.name}, Specialty: ${m.specialty ?? 'General'}`).join("\n")
      : "Tidak ada anggota tim terdaftar.";

    // 2. Generate Object dengan AI
    const { object: newTasksData } = await generateObject({
      model: google((process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash") as string),
      schema: MultiTaskSchema,
      system: `Kamu adalah asisten AI Scrum Master.
Tugasmu adalah menganalisis instruksi tambahan dari user dan memecahnya menjadi BEBERAPA task terpisah yang masuk akal.
Pilih satu orang (assigneeName) dari daftar Anggota Tim yang Tersedia yang paling cocok berdasarkan spesialisasinya. Tulis namanya sama persis.
Tingkat kesulitan (effortScore) adalah 1-5. Gunakan bahasa Indonesia.`,
      prompt: `Instruksi User: "${prompt}"\n\nDaftar Anggota Tim:\n${membersSummary}\n\nBuat daftar task baru berdasar instruksi tersebut.`,
    });

    // Hitung order awal (taruh di paling bawah TODO list)
    let currentOrder = project.tasks.length > 0 
      ? Math.max(...project.tasks.map(t => t.order)) + 1 
      : 0;
    // 3. Persiapkan data task untuk insert bulk
    const tasksToInsert = newTasksData.tasks.map((taskData) => {
      const assignedUser = teamMembers.find(m => m.user.name?.toLowerCase() === taskData.assigneeName.toLowerCase());
      const assigneeId = assignedUser?.userId ?? null;

      const task = {
        title: taskData.title,
        description: taskData.description,
        effortScore: taskData.effortScore,
        status: "TODO" as const,
        order: currentOrder,
        projectId: projectId,
        assigneeId: assigneeId,
      };
      
      currentOrder++;
      return task;
    });

    // 4. Simpan ke database
    await prisma.task.createMany({
      data: tasksToInsert
    });

    // 5. Revalidate Path agar UI ter-update
    revalidatePath(`/project/${projectId}`);

    return { success: true, tasks: tasksToInsert };
  } catch (error: any) {
    console.error("[generateSingleTask] Error:", error);
    return { success: false, error: error.message ?? "Terjadi kesalahan saat generate task." };
  }
}
