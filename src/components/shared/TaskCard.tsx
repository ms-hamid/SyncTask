import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

// ============================================================
// Types
// ============================================================
export interface TaskCardProps {
  title: string;
  description?: string | null;
  status: "TODO" | "DOING" | "DONE";
  effortScore?: number | null;
  requiredSpecialty?: string | null;
  assigneeName?: string | null;
  assigneeAvatar?: string | null;
}

// ============================================================
// Helpers
// ============================================================

type SpecialtyColor = {
  bg: string;
  text: string;
  dot: string;
};

const SPECIALTY_COLORS: Record<string, SpecialtyColor> = {
  Frontend:  { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"   },
  Backend:   { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  "UI/UX":   { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  DevOps:    { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  QA:        { bg: "bg-rose-50",   text: "text-rose-700",   dot: "bg-rose-500"   },
  Mobile:    { bg: "bg-cyan-50",   text: "text-cyan-700",   dot: "bg-cyan-500"   },
  Data:      { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500"  },
  General:   { bg: "bg-slate-50",  text: "text-slate-600",  dot: "bg-slate-400"  },
};

const STATUS_ACCENT: Record<TaskCardProps["status"], string> = {
  TODO:  "border-l-slate-300",
  DOING: "border-l-amber-400",
  DONE:  "border-l-emerald-400",
};

function EffortDots({ score }: { score: number }) {
  const clamped = Math.max(1, Math.min(5, score));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block w-1.5 h-1.5 rounded-full transition-all ${
            i < clamped ? "bg-indigo-400" : "bg-slate-200"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-slate-500">{clamped}/5</span>
    </div>
  );
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
      <span className="text-[9px] font-bold text-white">{initials}</span>
    </div>
  );
}

// ============================================================
// Component
// ============================================================
export function TaskCard({
  title,
  description,
  status,
  effortScore,
  requiredSpecialty,
  assigneeName,
  assigneeAvatar,
}: TaskCardProps) {
  const specialty = requiredSpecialty ?? "General";
  const colors = SPECIALTY_COLORS[specialty] ?? SPECIALTY_COLORS["General"];
  const accentBorder = STATUS_ACCENT[status];

  return (
    <Card
      className={`
        group relative rounded-xl border border-slate-100 bg-white
        shadow-sm shadow-slate-100 hover:shadow-md hover:shadow-slate-200/70
        hover:-translate-y-0.5 transition-all duration-200
        border-l-4 ${accentBorder}
        overflow-hidden cursor-pointer
      `}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        {/* Top row: Specialty badge + Effort */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            className={`
              px-2 py-0.5 text-xs font-semibold rounded-full border-0
              ${colors.bg} ${colors.text}
            `}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${colors.dot}`} />
            {specialty}
          </Badge>

          {effortScore != null && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Flame className="w-3 h-3 text-orange-400" />
              <EffortDots score={effortScore} />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {title}
        </h3>

        {/* Description preview */}
        {description && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {/* Bottom: Assignee */}
        {assigneeName && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
            {assigneeAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={assigneeAvatar}
                alt={assigneeName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <AvatarFallback name={assigneeName} />
            )}
            <span className="text-xs text-slate-500 font-medium truncate">
              {assigneeName}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
