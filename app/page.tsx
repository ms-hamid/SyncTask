import { prisma } from "@/src/lib/prisma";
import { CreateProjectSection, MEMBER_NAMES } from "@/src/components/shared/CreateProjectSection";
import { KanbanBoard, KanbanTask } from "@/src/components/shared/KanbanBoard";
import { Sparkles, Kanban, Users } from "lucide-react";

// ============================================================
// Server Component — data di-fetch langsung di sini
// Tidak ada 'use client', tidak ada useState/useEffect
// ============================================================
export default async function HomePage() {
  // Ambil project terbaru + semua task-nya
  const latestProject = await prisma.project.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        orderBy: { order: "asc" },
      },
    },
  });

  // Petakan Task dari DB ke format KanbanTask untuk KanbanBoard
  const kanbanTasks: KanbanTask[] = latestProject?.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status as KanbanTask["status"],
    order: task.order,
    effortScore: task.effortScore,
    requiredSpecialty: null, // specialty tidak tersimpan di Task, bisa ditambah nanti
    assigneeName: task.assigneeId ? (MEMBER_NAMES[task.assigneeId] ?? task.assigneeId) : null,
    assigneeAvatar: null,
  })) ?? [];

  const todoCount  = kanbanTasks.filter((t) => t.status === "TODO").length;
  const doingCount = kanbanTasks.filter((t) => t.status === "DOING").length;
  const doneCount  = kanbanTasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero / Header Section */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-12 pt-20">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide">
              SyncTask AI
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Ceritakan Proyekmu.
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
              AI yang Mengatur Sisanya.
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-xl">
            Deskripsikan proyek dalam bahasa natural. AI Scrum Master akan memecahnya
            menjadi task, menentukan tingkat kesulitan, dan mengassign ke tim secara otomatis.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Form Section */}
        <section>
          {/* Client wrapper: menangani toast + reset form */}
          <CreateProjectSection />
        </section>

        {/* Kanban Section */}
        {latestProject ? (
          <section className="space-y-5">
            {/* Section Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Kanban className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Proyek Terbaru
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {latestProject.name}
                </h2>
                {latestProject.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-prose line-clamp-2">
                    {latestProject.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5">
                  <Users className="w-3 h-3" />
                  {kanbanTasks.length} Tasks
                </div>
                <div className="flex items-center gap-1 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-slate-500 dark:text-slate-400">{todoCount} Todo</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-500 dark:text-slate-400">{doingCount} Doing</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-500 dark:text-slate-400">{doneCount} Done</span>
                </div>
              </div>
            </div>

            <KanbanBoard tasks={kanbanTasks} />
          </section>
        ) : (
          /* Empty state — belum ada project */
          <section className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Kanban className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
              Belum ada proyek
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-xs">
              Isi form di atas dan biarkan AI Scrum Master membangun rencana proyekmu.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
