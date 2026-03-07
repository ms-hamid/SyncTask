"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

// ============================================================
// Props
// ============================================================
interface CreateProjectFormProps {
  /**
   * Callback saat form di-submit — menerima string prompt dari user.
   * Komponen ini hanya bertanggung jawab pada UI (dumb component).
   */
  onSubmit: (prompt: string) => Promise<void>;
}

// ============================================================
// Component
// ============================================================
export function CreateProjectForm({ onSubmit }: CreateProjectFormProps) {
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();

  const isDisabled = isPending || prompt.trim().length < 10;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isDisabled) return;

    startTransition(async () => {
      await onSubmit(prompt.trim());
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 bg-white overflow-hidden">
        {/* Header */}
        <CardHeader className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              AI Scrum Master
            </span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 mt-1">
            Mulai Proyek Baru
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
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
                  min-h-[180px] resize-none rounded-xl border-slate-200
                  bg-slate-50 p-4 text-slate-800 text-sm leading-relaxed
                  placeholder:text-slate-400
                  focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                  transition-all duration-200
                "
                disabled={isPending}
              />
              {/* Character count hint */}
              <div className="absolute bottom-3 right-3 text-xs text-slate-300 select-none">
                {prompt.length}
              </div>
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
                text-white shadow-lg shadow-indigo-200
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
              <p className="text-xs text-center text-amber-500">
                Deskripsikan proyekmu lebih detail (minimal 10 karakter).
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
