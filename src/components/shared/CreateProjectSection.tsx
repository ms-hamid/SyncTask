"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreateProjectForm } from "@/src/components/shared/CreateProjectForm";
import { generateProjectTasks, TeamMemberInput } from "@/src/actions/project";

// ============================================================
// CreateProjectSection
// ============================================================
const MOCK_TEAM_ID = "team-mvp-001";

// Nama anggota untuk ditampilkan di TaskCard (fallback map lama, bisa dibuang perlahan, atau kita siapkan struktur dinamis)
export const MEMBER_NAMES: Record<string, string> = {};

import { TeamMemberFormInput } from "./CreateProjectForm";

interface CreateProjectSectionProps {
  teamId?: string;
}

// ============================================================
// Client wrapper — handles toast + reset form
// Server Component (page.tsx) tidak bisa punya state,
// jadi komponen ini menjadi jembatan ke Server Action.
// ============================================================
export function CreateProjectSection({
  teamId = MOCK_TEAM_ID,
}: CreateProjectSectionProps) {
  const [key, setKey] = useState(0); // reset form dengan mengubah key

  async function handleSubmit(prompt: string, teamMembers: TeamMemberFormInput[]) {
    // Map form inputs to Action inputs
    // Gunakan nama sbg userId agar auto tersimpan dgn unik
    const dynamicMembers: TeamMemberInput[] = teamMembers.map((m) => ({
      userId: m.name, // Nama digunakan sbg alias/ID untuk MVP kali ini
      specialty: m.specialty || "Member",
      role: "MEMBER"
    }));
    const toastId = toast.loading("AI Scrum Master sedang bekerja...", {
      description: "Memecah proyek menjadi task terstruktur...",
    });

    try {
      const result = await generateProjectTasks(prompt, teamId, dynamicMembers);

      if (result.success) {
        toast.success(`Proyek "${result.projectName}" berhasil dibuat! 🎉`, {
          id: toastId,
          description: `${result.tasksCreated} task telah di-assign ke tim.`,
          duration: 5000,
        });
        // Reset form dengan re-mount
        setKey((k) => k + 1);
      } else {
        toast.error("Gagal membuat proyek", {
          id: toastId,
          description: result.error ?? "Terjadi kesalahan tidak terduga.",
          duration: 6000,
        });
      }
    } catch {
      toast.error("Koneksi terputus", {
        id: toastId,
        description: "Gagal menghubungi server. Periksa koneksi internet kamu.",
        duration: 6000,
      });
    }
  }

  return <CreateProjectForm key={key} onSubmit={handleSubmit} />;
}

export { MOCK_TEAM_ID };
