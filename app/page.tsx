import { prisma } from "@/src/lib/prisma";
import { CreateProjectSection } from "@/src/components/shared/CreateProjectSection";
import { Sparkles, FolderKanban, Calendar, ArrowRight, LayoutDashboard, Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ============================================================
// Server Component — data di-fetch langsung di sini
// Tidak ada 'use client', tidak ada useState/useEffect
// ============================================================
export default async function DashboardPage() {
  const MOCK_TEAM_ID = "team-mvp-001";

  // Ambil semua project beserta jumlah task dan statusnya
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { tasks: true }
      },
      tasks: {
        select: { status: true }
      }
    },
  });

  // Ambil status plan team & hitung total project
  const team = await prisma.team.findUnique({
    where: { id: MOCK_TEAM_ID },
    select: { planStatus: true, _count: { select: { projects: true } } }
  });

  const planStatus = team?.planStatus || "FREE";
  const projectCount = team?._count?.projects || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero / Header Section */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-12 pt-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide">
                SyncTask AI
              </span>
            </div>
            <div className="flex items-center gap-3">
               <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${planStatus === 'PRO' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400'}`}>
                 {planStatus} PLAN
               </div>
               {planStatus === 'FREE' && (
                  <Link href={`/mock-checkout?teamId=${MOCK_TEAM_ID}`}>
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xl transition-all font-semibold rounded-xl ml-2">
                       <Rocket className="w-4 h-4 mr-2" /> Upgrade to Pro Workspace
                    </Button>
                  </Link>
               )}
            </div>
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
          <CreateProjectSection teamId={MOCK_TEAM_ID} planStatus={planStatus} projectCount={projectCount} />
        </section>

        {/* Projects Grid Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <LayoutDashboard className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Dashboard Proyek
            </h2>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const totalTasks = project._count.tasks;
                const doneTasks = project.tasks.filter(t => t.status === "DONE").length;
                const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                return (
                  <Link href={`/project/${project.id}`} key={project.id} className="group">
                    <div className="flex flex-col h-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-indigo-400/50 dark:hover:border-indigo-500/50 transition-all duration-300">
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                          <FolderKanban className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-full">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(project.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {project.name}
                      </h3>
                      
                      {project.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-grow mb-6">
                          {project.description}
                        </p>
                      )}

                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-xs font-semibold mb-2">
                          <span className="text-slate-600 dark:text-slate-300">Progress</span>
                          <span className={progress === 100 ? "text-emerald-500" : "text-indigo-600 dark:text-indigo-400"}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${progress === 100 ? 'bg-emerald-500' : 'bg-linear-to-r from-indigo-500 to-purple-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                        Buka Proyek <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Empty state — belum ada project */
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-4 shadow-sm">
                <LayoutDashboard className="w-7 h-7 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                Belum ada proyek yang dibuat
              </h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-sm">
                Isi form di atas dan biarkan AI Scrum Master merencanakan proyek pertamamu secara instan!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
