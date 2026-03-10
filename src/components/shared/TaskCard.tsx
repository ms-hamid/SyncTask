import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import React, { memo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

export interface TaskCardProps {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "DOING" | "DONE";
  effortScore?: number | null;
  requiredSpecialty?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeAvatar?: string | null;
  // Context
  projectId?: string;
  teamMembers?: any[];
  // DnD Props
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: DraggableProvidedDraggableProps;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragging?: boolean;
}

import { updateTaskDetails, deleteTask } from "@/src/actions/manualTask";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { updateTaskStatus } from "@/src/actions/project";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ============================================================
// Helpers
// ============================================================

const TEAM_MAP: Record<string, { name: string; role: string; color: string }> = {
  'u1': { name: 'Ahmad', role: 'Frontend', color: 'bg-blue-500' },
  'u2': { name: 'Siti', role: 'Backend', color: 'bg-emerald-500' },
  'u3': { name: 'Budi', role: 'UI/UX', color: 'bg-purple-500' }
};

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

function AvatarFallback({ name, colorClass }: { name: string; colorClass?: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const bg = colorClass || "bg-linear-to-br from-indigo-400 to-purple-500";
  return (
    <div className={`w-6 h-6 rounded-full ${bg} flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.1)]`}>
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
  assigneeId: initialAssigneeId,
  assigneeName,
  assigneeAvatar,
  projectId = "",
  teamMembers = [],
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging,
}: TaskCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const specialty = requiredSpecialty ?? "General";
  const colors = SPECIALTY_COLORS[specialty] ?? SPECIALTY_COLORS["General"];
  const accentBorder = STATUS_ACCENT[status];
  
  // Inline Editing State
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description || "");
  const [editAssigneeId, setEditAssigneeId] = useState(initialAssigneeId || "");
  
  const isDirty = editTitle !== title || editDesc !== (description || "") || editAssigneeId !== (initialAssigneeId || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state if props change
  React.useEffect(() => {
    setEditTitle(title);
    setEditDesc(description || "");
    setEditAssigneeId(initialAssigneeId || "");
  }, [title, description, initialAssigneeId]);

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    setIsSaving(true);
    const toastId = toast.loading("Menyimpan perubahan...");
    const res = await updateTaskDetails(id, {
      title: editTitle,
      description: editDesc,
      assigneeId: editAssigneeId || null,
    });
    setIsSaving(false);
    if (res.success) {
      toast.success("Perubahan disimpan", { id: toastId });
    } else {
      toast.error("Gagal menyimpan", { id: toastId, description: res.error });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus task ini?")) return;
    setIsDeleting(true);
    const toastId = toast.loading("Menghapus task...");
    const res = await deleteTask(id);
    setIsDeleting(false);
    if (res.success) {
      toast.success("Task dihapus", { id: toastId });
      setIsModalOpen(false);
    } else {
      toast.error("Gagal menghapus", { id: toastId, description: res.error });
    }
  };

  const assignedMember = teamMembers.find(m => m.userId === initialAssigneeId);
  const mappedAssigneeRole = assignedMember?.specialty || TEAM_MAP[assigneeName ?? ""]?.role || 'Member';
  const mappedAssigneeColor = TEAM_MAP[assigneeName ?? ""]?.color || 'bg-indigo-500';

  const mappedAssignee = assigneeName && (assignedMember || TEAM_MAP[assigneeName])
    ? { name: assigneeName, role: mappedAssigneeRole, color: mappedAssigneeColor } 
    : { name: assigneeName ?? '', role: 'Member', color: 'bg-indigo-500' };

  return (
    <>
      <Card
        id={id}
        ref={innerRef}
        {...draggableProps}
        {...dragHandleProps}
        onClick={() => setIsModalOpen(true)}
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
          <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-slate-700/50 transition-colors group-hover:border-slate-100 dark:group-hover:border-slate-700">
            {assigneeAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assigneeAvatar} alt={mappedAssignee.name} className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" />
            ) : (
              <AvatarFallback name={mappedAssignee.name} colorClass={mappedAssignee.color} />
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                {mappedAssignee.name}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] gap-6">
          <DialogHeader>
            <Input 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              className="text-2xl font-bold border-0 px-0 h-auto focus-visible:ring-0 shadow-none hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors" 
              placeholder="Task Title"
            />
            <DialogDescription className="sr-only">Task details for {title}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-3">
            <Select 
              value={status} 
              disabled={isUpdating}
              onValueChange={async (val: "TODO" | "DOING" | "DONE") => {
                const toastId = toast.loading("Mengubah status...");
                setIsUpdating(true);
                const res = await updateTaskStatus(id, val);
                setIsUpdating(false);
                if (res.success) {
                  toast.success("Status berhasil diubah!", { id: toastId });
                  setIsModalOpen(false); // Opsional: tutup modal setelah ubah status, atau biar terbuka saja
                } else {
                  toast.error("Gagal mengubah status", { id: toastId, description: res.error });
                }
              }}
            >
              <SelectTrigger className={`h-8 px-3 rounded-full border-0 font-semibold text-xs w-auto min-w-[100px] ${status === 'TODO' ? 'text-slate-800 bg-slate-100' : status === 'DOING' ? 'text-amber-800 bg-amber-100' : 'text-emerald-800 bg-emerald-100'} dark:bg-opacity-20 focus:ring-0 shadow-none`}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO" className="text-xs font-semibold">To Do</SelectItem>
                <SelectItem value="DOING" className="text-xs font-semibold text-amber-600 dark:text-amber-500">In Progress</SelectItem>
                <SelectItem value="DONE" className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">Done</SelectItem>
              </SelectContent>
            </Select>

            <Badge className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border-0 ${colors.bg} ${colors.text}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${colors.dot}`} />
              {specialty}
            </Badge>

            {effortScore != null && (
               <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                 <Flame className="w-3.5 h-3.5 text-orange-400" />
                 Effort: {effortScore}/5
               </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Description</h4>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 max-h-[300px] overflow-y-auto hover:border-indigo-200 transition-colors">
              <Textarea 
                value={editDesc} 
                onChange={(e) => setEditDesc(e.target.value)} 
                className="min-h-[100px] border-0 focus-visible:ring-0 shadow-none bg-transparent resize-y p-2"
                placeholder="No description provided. Click to add one."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="flex flex-col flex-1">
                <span className="text-xs text-slate-500 font-medium mb-1">Assignee</span>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-indigo-600"
                  value={editAssigneeId}
                  onChange={(e) => setEditAssigneeId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((tm: any) => (
                    <option key={tm.id} value={tm.userId}>
                      {tm.user.name} ({tm.specialty || "Member"})
                    </option>
                  ))}
                </select>
             </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
             <Button 
               variant="destructive" 
               size="icon" 
               onClick={handleDelete}
               disabled={isDeleting}
               title="Delete Task"
             >
               <Trash2 className="w-4 h-4" />
             </Button>

             {isDirty && (
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || !editTitle.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

TaskCard.displayName = "TaskCard";
