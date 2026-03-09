"use client";

import { useState, useTransition } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateTasksFromPrompt } from "@/src/actions/singleTask";
import { toast } from "sonner";

export function AITaskAssistant({ projectId }: { projectId: string }) {
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();

  const isDisabled = isPending || prompt.trim().length < 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    startTransition(async () => {
      const toastId = toast.loading("AI sedang menganalisis dan memecah tugas...", {
        description: "Mencari orang yang tepat dan menghitung tingkat kesulitan."
      });

      const result = await generateTasksFromPrompt(prompt, projectId);

      if (result.success) {
        toast.success(`${result.tasks?.length ?? 0} Task baru berhasil ditambahkan!`, { id: toastId });
        setPrompt("");
      } else {
        toast.error("Gagal menambahkan task", {
          id: toastId,
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          AI Task Assistant
        </span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isPending}
          placeholder="Ketik tugas di sini... (e.g. 'Buat tombol login dengan Google')"
          className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        />
        <Button
          type="submit"
          disabled={isDisabled}
          className="rounded-xl px-6 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Tambah
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
