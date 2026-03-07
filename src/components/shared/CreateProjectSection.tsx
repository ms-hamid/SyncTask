"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreateProjectForm } from "@/src/components/shared/CreateProjectForm";
import { generateProjectTasks, TeamMemberInput } from "@/src/actions/project";

// ============================================================
// Mock data MVP — diganti dengan data real dari auth/DB nanti
// ============================================================
const MOCK_TEAM_ID = "team-mvp-001";

const MOCK_MEMBERS: TeamMemberInput[] = [
  { userId: "u1", specialty: "Frontend", role: "MEMBER" },
  { userId: "u2", specialty: "Backend",  role: "MEMBER" },
  { userId: "u3", specialty: "UI/UX",    role: "OWNER"  },
];

// Nama anggota untuk ditampilkan di TaskCard (keyed by userId)
export const MEMBER_NAMES: Record<string, string> = {
  u1: "Ahmad",
  u2: "Siti",
  u3: "Budi",
};

interface CreateProjectSectionProps {
  teamId?: string;
  members?: TeamMemberInput[];
}

// ============================================================
// Client wrapper — handles toast + reset form
// Server Component (page.tsx) tidak bisa punya state,
// jadi komponen ini menjadi jembatan ke Server Action.
// ============================================================
export function CreateProjectSection({
  teamId = MOCK_TEAM_ID,
  members = MOCK_MEMBERS,
}: CreateProjectSectionProps) {
  const [key, setKey] = useState(0); // reset form dengan mengubah key

  async function handleSubmit(prompt: string) {
    const toastId = toast.loading("AI Scrum Master sedang bekerja...", {
      description: "Memecah proyek menjadi task terstruktur...",
    });

    try {
      const result = await generateProjectTasks(prompt, teamId, members);

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

export { MOCK_TEAM_ID, MOCK_MEMBERS };
