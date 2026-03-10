export default function ProjectLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header Skeleton */}
      <header className="relative md:sticky top-0 z-40 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 md:py-8 flex flex-col gap-3 md:gap-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Board Skeleton */}
      <main className="px-4 md:px-6 py-4 md:py-8 flex-1 w-full overflow-hidden">
        <div className="flex flex-nowrap overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 w-full max-w-[1400px] mx-auto h-full">
          {/* Column 1: TO DO */}
          <div className="w-[85vw] shrink-0 snap-center md:w-auto flex flex-col h-full bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              <div className="h-5 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm h-[140px] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                    <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: IN PROGRESS */}
          <div className="w-[85vw] shrink-0 snap-center md:w-auto flex flex-col h-full bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              <div className="h-5 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm h-[140px] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: DONE */}
          <div className="w-[85vw] shrink-0 snap-center md:w-auto flex flex-col h-full bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              <div className="h-5 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col gap-3">
              {[1].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm h-[140px] flex flex-col justify-between opacity-70">
                  <div className="flex justify-between items-start">
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
