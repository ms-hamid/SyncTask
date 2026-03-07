import { TaskCard, TaskCardProps } from "./TaskCard";

// ============================================================
// Types
// ============================================================
export type TaskStatus = "TODO" | "DOING" | "DONE";

export interface KanbanTask extends Omit<TaskCardProps, "status"> {
  id: string;
  status: TaskStatus;
}

interface KanbanBoardProps {
  tasks: KanbanTask[];
}

// ============================================================
// Column Config
// ============================================================
const COLUMNS: {
  id: TaskStatus;
  label: string;
  emoji: string;
  bg: string;
  headerBg: string;
  headerText: string;
  countBg: string;
  countText: string;
  border: string;
}[] = [
  {
    id: "TODO",
    label: "To Do",
    emoji: "📋",
    bg: "bg-slate-50",
    headerBg: "bg-slate-100",
    headerText: "text-slate-700",
    countBg: "bg-slate-200",
    countText: "text-slate-600",
    border: "border-slate-200",
  },
  {
    id: "DOING",
    label: "In Progress",
    emoji: "⚡",
    bg: "bg-amber-50",
    headerBg: "bg-amber-100",
    headerText: "text-amber-800",
    countBg: "bg-amber-200",
    countText: "text-amber-700",
    border: "border-amber-200",
  },
  {
    id: "DONE",
    label: "Done",
    emoji: "✅",
    bg: "bg-emerald-50",
    headerBg: "bg-emerald-100",
    headerText: "text-emerald-800",
    countBg: "bg-emerald-200",
    countText: "text-emerald-700",
    border: "border-emerald-200",
  },
];

// ============================================================
// Empty state subcomponent
// ============================================================
function EmptyColumn({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center mb-3 shadow-sm">
        <span className="text-lg">✦</span>
      </div>
      <p className="text-xs text-slate-400 font-medium">
        Belum ada task di {label}
      </p>
    </div>
  );
}

// ============================================================
// Component
// ============================================================
export function KanbanBoard({ tasks }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className={`
              flex flex-col rounded-2xl border ${col.border}
              ${col.bg} overflow-hidden min-h-[400px]
            `}
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between px-4 py-3 ${col.headerBg}`}>
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden="true">{col.emoji}</span>
                <h2 className={`text-sm font-bold ${col.headerText}`}>
                  {col.label}
                </h2>
              </div>
              <span
                className={`
                  inline-flex items-center justify-center
                  min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold
                  ${col.countBg} ${col.countText}
                `}
              >
                {colTasks.length}
              </span>
            </div>

            {/* Task List */}
            <div className="flex flex-col gap-3 p-3 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <EmptyColumn label={col.label} />
              ) : (
                colTasks.map((task) => (
                  <TaskCard key={task.id} {...task} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
