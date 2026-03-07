import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import React, { memo } from "react";

export interface TaskCardProps {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "DOING" | "DONE";
  effortScore?: number | null;
  requiredSpecialty?: string | null;
  assigneeName?: string | null;
  assigneeAvatar?: string | null;
  // DnD Props
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: Record<string, any>;
  dragHandleProps?: Record<string, any> | null;
  isDragging?: boolean;
}

// ============================================================
// Helpers
// ============================================================

type SpecialtyColor = { bg: string; text: string; dot: string };

const SPECIALTY_COLORS: Record<string, SpecialtyColor> = {
  Frontend: { bg: "bg-blue-50 dark:bg-blue-950",     text: "text-blue-700 dark:text-blue-300",   dot: "bg-blue-500"   },
  Backend:  { bg: "bg-green-50 dark:bg-green-950",   text: "text-green-700 dark:text-green-300", dot: "bg-green-500"  },
  "UI/UX":  { bg: "bg-purple-50 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  DevOps:   { bg: "bg-orange-50 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
  QA:       { bg: "bg-rose-50 dark:bg-rose-950",     text: "text-rose-700 dark:text-rose-300",   dot: "bg-rose-500"   },
  Mobile:   { bg: "bg-cyan-50 dark:bg-cyan-950",     text: "text-cyan-700 dark:text-cyan-300",   dot: "bg-cyan-500"   },
  Data:     { bg: "bg-amber-50 dark:bg-amber-950",   text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500"  },
  General:  { bg: "bg-slate-50 dark:bg-slate-800",   text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400"  },
};

const STATUS_ACCENT: Record<TaskCardProps["status"], string> = {
  TODO:  "border-l-slate-300 dark:border-l-slate-600",
  DOING: "border-l-amber-400 dark:border-l-amber-500",
  DONE:  "border-l-emerald-400 dark:border-l-emerald-500",
};

function EffortDots({ score }: { score: number }) {
  const clamped = Math.max(1, Math.min(5, score));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            i < clamped ? "bg-indigo-400" : "bg-slate-200 dark:bg-slate-700"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">{clamped}/5</span>
    </div>
  );
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
      <span className="text-[9px] font-bold text-white">{initials}</span>
    </div>
  );
}

// ============================================================
// Component (Dioptimalkan dengan React.memo untuk cegah re-render berlebih)
// ============================================================
export const TaskCard = memo(({
  id,
  title,
  description,
  status,
  effortScore,
  requiredSpecialty,
  assigneeName,
  assigneeAvatar,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging,
}: TaskCardProps) => {
  const specialty = requiredSpecialty ?? "General";
  const colors = SPECIALTY_COLORS[specialty] ?? SPECIALTY_COLORS["General"];
  const accentBorder = STATUS_ACCENT[status];

  return (
    <Card
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className={`
        group relative rounded-xl
        border border-slate-100 dark:border-slate-700/60
        bg-white dark:bg-slate-800
        shadow-sm shadow-slate-100 dark:shadow-slate-900/40
        border-l-4 ${accentBorder}
        overflow-hidden cursor-grab active:cursor-grabbing will-change-transform
        ${
          isDragging
            ? "shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30 ring-2 ring-indigo-500/20 z-50 opacity-100!"
            : "hover:shadow-md hover:shadow-slate-200/70 dark:hover:shadow-slate-900/60 opacity-100"
        }
      `}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        {/* Header: Specialty + Effort */}
        <div className="flex items-start justify-between gap-2">
          <Badge className={`px-2 py-0.5 text-xs font-semibold rounded-full border-0 ${colors.bg} ${colors.text}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${colors.dot}`} />
            {specialty}
          </Badge>
          {effortScore != null && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <EffortDots score={effortScore} />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {/* Assignee */}
        {assigneeName && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
            {assigneeAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assigneeAvatar} alt={assigneeName} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <AvatarFallback name={assigneeName} />
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {assigneeName}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TaskCard.displayName = "TaskCard";
