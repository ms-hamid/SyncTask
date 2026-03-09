import { prisma } from "@/src/lib/prisma";
import { KanbanBoard, KanbanTask } from "@/src/components/shared/KanbanBoard";
import { AITaskAssistant } from "@/src/components/shared/AITaskAssistant";
import { Kanban, Users, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch the specific project
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: { order: "asc" },
      },
      team: {
        include: {
          members: {
            include: { user: true }
          }
        }
      }
    },
  });

  if (!project) {
    notFound();
  }

  // Petakan Task dari DB ke format KanbanTask untuk KanbanBoard
  const kanbanTasks: KanbanTask[] = project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status as KanbanTask["status"],
    order: task.order,
    effortScore: task.effortScore,
    requiredSpecialty: null, // specialty tidak tersimpan di Task, bisa ditambah nanti
    assigneeId: task.assigneeId,
    assigneeName: task.assigneeId
      ? project.team?.members.find(m => m.userId === task.assigneeId)?.user.name ?? task.assigneeId
      : null,
    assigneeAvatar: null,
  })) ?? [];

  const todoCount = kanbanTasks.filter((t) => t.status === "TODO").length;
  const doingCount = kanbanTasks.filter((t) => t.status === "DOING").length;
  const doneCount = kanbanTasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header Area */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>

          <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Kanban className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(project.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 shrink-0 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col items-center px-4 border-r border-slate-200 dark:border-slate-700">
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {kanbanTasks.length}
                </span>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Total Tasks
                </span>
              </div>
              <div className="flex flex-col gap-1.5 px-2">
                <div className="flex items-center gap-2 text-xs font-medium min-w-[90px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-slate-600 dark:text-slate-400 flex-1">
                    Todo
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {todoCount}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium min-w-[90px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-amber-700 dark:text-amber-500 flex-1">
                    Doing
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {doingCount}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium min-w-[90px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-500 flex-1">
                    Done
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {doneCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Micro-prompting AI Task Assistant */}
          <div className="max-w-2xl">
            <AITaskAssistant projectId={id} />
          </div>
        </div>
      </section>

      {/* Main Board Area */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <KanbanBoard tasks={kanbanTasks} projectId={project.id} teamMembers={project.team?.members || []} />
      </div>
    </div>
  );
}
