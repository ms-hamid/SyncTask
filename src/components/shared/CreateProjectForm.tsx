"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Plus, Trash2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface TeamMemberFormInput {
  name: string;
  specialty: string;
}

interface CreateProjectFormProps {
  onSubmit: (prompt: string, teamMembers: TeamMemberFormInput[]) => Promise<void>;
}

export function CreateProjectForm({ onSubmit }: CreateProjectFormProps) {
  const [prompt, setPrompt] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMemberFormInput[]>([
    { name: "", specialty: "" }
  ]);
  const [isPending, startTransition] = useTransition();

  // Disable submit if prompt is too short or if there are no team members or empty names
  const isDisabled = 
    isPending || 
    prompt.trim().length < 10 || 
    teamMembers.length === 0 || 
    teamMembers.some((m) => !m.name.trim());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isDisabled) return;
    startTransition(async () => {
      // Filter out any purely empty members just in case
      const validMembers = teamMembers.filter((m) => m.name.trim() !== "");
      await onSubmit(prompt.trim(), validMembers);
    });
  }

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", specialty: "" }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMemberFormInput, value: string) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <CardHeader className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              AI Scrum Master
            </span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            Mulai Proyek Baru
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deskripsikan proyekmu, dan AI akan memecahnya menjadi task yang siap dikerjakan oleh timmu.
          </p>
        </CardHeader>

        {/* Form */}
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ceritakan proyek apa yang ingin timmu bangun..."
                className="
                  min-h-[180px] resize-none rounded-xl
                  border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  text-slate-800 dark:text-slate-100
                  placeholder:text-slate-400 dark:placeholder:text-slate-500
                  focus:bg-white dark:focus:bg-slate-800/80
                  focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900
                  transition-all duration-200 p-4 text-sm leading-relaxed
                "
                disabled={isPending}
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-300 dark:text-slate-600 select-none">
                {prompt.length}
              </div>
            </div>
            
            <div className="flex justify-end mt-0.5">
              <button
                type="button"
                onClick={() => {
                  setPrompt("Buatkan aplikasi manajemen kasir (POS) untuk kedai kopi. Kita butuh fitur kasir real-time, cetak struk, manajemen inventori stok barang, dan dashboard laporan harian.");
                  setTeamMembers([
                    { name: "Budi", specialty: "Frontend" },
                    { name: "Siti", specialty: "Backend" },
                    { name: "Tono", specialty: "UI/UX" }
                  ]);
                }}
                className="text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                ✨ Coba Prompt Contoh
              </button>
            </div>

            {/* Tim & Anggota */}
            <div className="flex flex-col gap-3 mt-2 border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Anggota Tim
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {teamMembers.length} Anggota
                </span>
              </div>

              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      placeholder="Nama (e.g. Budi)"
                      value={member.name}
                      onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                      disabled={isPending}
                      className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                    <Input
                      placeholder="Peran/Specialty (e.g. Frontend)"
                      value={member.specialty}
                      onChange={(e) => updateTeamMember(index, "specialty", e.target.value)}
                      disabled={isPending}
                      className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeamMember(index)}
                      disabled={isPending || teamMembers.length <= 1}
                      className="shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTeamMember}
                disabled={isPending || teamMembers.length >= 10}
                className="w-full rounded-xl border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 mt-2"
              >
                <Plus className="w-4 h-4 mr-1" /> Tambah Anggota Tim
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isDisabled}
              size="lg"
              className="
                w-full rounded-xl h-12 text-sm font-semibold
                bg-linear-to-r from-indigo-600 to-purple-600
                hover:from-indigo-700 hover:to-purple-700
                disabled:from-indigo-300 disabled:to-purple-300
                dark:disabled:from-indigo-800 dark:disabled:to-purple-800
                text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40
                transition-all duration-200
              "
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agen sedang berpikir...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Task Plan
                </>
              )}
            </Button>

            {prompt.trim().length > 0 && prompt.trim().length < 10 && (
              <p className="text-xs text-center text-amber-500 dark:text-amber-400">
                Deskripsikan proyekmu lebih detail (minimal 10 karakter).
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
