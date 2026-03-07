"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface CreateProjectFormProps {
  onSubmit: (prompt: string) => Promise<void>;
}

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
