"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CreateProjectForm } from "@/src/components/shared/CreateProjectForm";
import { generateProjectTasks, TeamMemberInput } from "@/src/actions/project";
import { createCheckoutLink } from "@/src/actions/payment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2 } from "lucide-react";

// ============================================================
// CreateProjectSection
// ============================================================
const MOCK_TEAM_ID = "team-mvp-001";

// Nama anggota untuk ditampilkan di TaskCard (fallback map lama, bisa dibuang perlahan, atau kita siapkan struktur dinamis)
export const MEMBER_NAMES: Record<string, string> = {};

import { TeamMemberFormInput } from "./CreateProjectForm";

interface CreateProjectSectionProps {
  teamId?: string;
  planStatus?: string;
  projectCount?: number;
}

// ============================================================
// Client wrapper — handles toast + reset form
// Server Component (page.tsx) tidak bisa punya state,
// jadi komponen ini menjadi jembatan ke Server Action.
// ============================================================
export function CreateProjectSection({
  teamId = MOCK_TEAM_ID,
  planStatus = "FREE",
  projectCount = 0,
}: CreateProjectSectionProps) {
  const [key, setKey] = useState(0); // reset form dengan mengubah key
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isPendingCheckout, startCheckout] = useTransition();

  async function handleUpgrade() {
    startCheckout(async () => {
      try {
        const { url } = await createCheckoutLink(teamId);
        window.location.href = url;
      } catch (error) {
         toast.error("Gagal memproses checkout.");
      }
    });
  }

  async function handleSubmit(prompt: string, teamMembers: TeamMemberFormInput[]) {
    // Paywall Check
    if (planStatus === "FREE" && projectCount >= 1) {
      setIsPaywallOpen(true);
      return;
    }
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

  return (
    <>
      <CreateProjectForm key={key} onSubmit={handleSubmit} />

      <Dialog open={isPaywallOpen} onOpenChange={setIsPaywallOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 border-0 shadow-2xl rounded-2xl">
          <div className="bg-white dark:bg-slate-950 p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
              <Rocket className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <DialogHeader className="mb-2">
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50 text-center">
                Upgrade to Pro Workspace
              </DialogTitle>
            </DialogHeader>
            
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-center mb-8 px-4">
              You've reached the maximum limit of 1 project on the Free Plan. Upgrade to unlock unlimited projects, advanced collaboration tools, and premium AI features.
            </DialogDescription>
            
            <Button 
              onClick={handleUpgrade}
              disabled={isPendingCheckout}
              className="w-full h-12 rounded-xl text-md font-bold transition-all shadow-md bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              {isPendingCheckout ? (
                 <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Processing...</span>
              ) : (
                <span className="flex items-center gap-2">🚀 Upgrade to Pro Workspace</span>
              )}
            </Button>
            
            <button onClick={() => setIsPaywallOpen(false)} className="mt-4 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
               Nanti Saja
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { MOCK_TEAM_ID };
