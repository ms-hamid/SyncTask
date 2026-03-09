"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { TaskCard, TaskCardProps } from "./TaskCard";
import { updateTaskOrder } from "../../actions/project";
import { createManualTask } from "../../actions/manualTask";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export type TaskStatus = "TODO" | "DOING" | "DONE";

export interface KanbanTask extends Omit<TaskCardProps, "status"> {
  id: string;
  status: TaskStatus;
  order: number;
}

interface KanbanBoardProps {
  tasks: KanbanTask[];
  projectId: string;
  teamMembers: any[];
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
    bg: "bg-slate-50 dark:bg-slate-900/50",
    headerBg: "bg-slate-100 dark:bg-slate-800/80",
    headerText: "text-slate-700 dark:text-slate-300",
    countBg: "bg-slate-200 dark:bg-slate-700",
    countText: "text-slate-600 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700/60",
  },
  {
    id: "DOING",
    label: "In Progress",
    emoji: "⚡",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    headerBg: "bg-amber-100 dark:bg-amber-900/40",
    headerText: "text-amber-800 dark:text-amber-300",
    countBg: "bg-amber-200 dark:bg-amber-800/60",
    countText: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/40",
  },
  {
    id: "DONE",
    label: "Done",
    emoji: "✅",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    headerBg: "bg-emerald-100 dark:bg-emerald-900/40",
    headerText: "text-emerald-800 dark:text-emerald-300",
    countBg: "bg-emerald-200 dark:bg-emerald-800/60",
    countText: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/40",
  },
];

function EmptyColumn({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
      <div className="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-800/60 flex items-center justify-center mb-3 shadow-sm">
        <span className="text-lg">✦</span>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
        Belum ada task di {label}
      </p>
    </div>
  );
}

// ============================================================
// Component
// ============================================================
export function KanbanBoard({ tasks: initialTasks, projectId, teamMembers }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [isMounted, setIsMounted] = useState(false);
  
  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");

  // Sync state dengan server props jika berubah (misal setelah generate AI baru)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Hindari Hydration Mismatch dari DragDropContext pd saat SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return; // Drop di luar kolom
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return; // Drop di tempat yang sama persis
    }

    const newStatus = destination.droppableId as TaskStatus;

    // Hitung array order baru
    const newTasks = Array.from(tasks);
    const draggedTaskIndex = newTasks.findIndex((t) => t.id === draggableId);
    if (draggedTaskIndex === -1) return;
    
    // Keluarkan item yang didrag
    const draggedTask = newTasks.splice(draggedTaskIndex, 1)[0];
    draggedTask.status = newStatus;

    // Filter tasks di kolom destinasi (sudah disort by order)
    const destTasks = newTasks
      .filter((t) => t.status === newStatus)
      .sort((a, b) => a.order - b.order);

    // Insert dragged task ke dalam urutan yang tepat (berdasarkan destination.index)
    destTasks.splice(destination.index, 0, draggedTask);

    // Filter tasks dari kolom lain agar tergabung utuh
    const otherTasks = newTasks.filter((t) => t.status !== newStatus);

    // Hitung ulang order hanya untuk task di kolom destinasi (0 sampai N)
    const updatedDestTasks = destTasks.map((t, index) => ({
      ...t,
      order: index,
    }));

    const previousTasks = [...tasks];

    // --- 1. OPTIMISTIC UI UPDATE ---
    // Gabungkan kembali state secara lokal secara instan (mengubah UI)
    setTasks([...otherTasks, ...updatedDestTasks]);

    // --- 2. SERVER ACTION ---
    // Extract payload yang berubah
    const payload = updatedDestTasks.map((t) => ({
      id: t.id,
      status: t.status,
      order: t.order,
    }));

    // API ke database di background secara asinkron tanpa memblokir/mengubah timing UI
    updateTaskOrder(payload).then((res) => {
        if (!res.success) {
            throw new Error(res.error || "Gagal mengatur urutan.");
        }
    }).catch((_error) => {
        // Rollback jika gagal
        setTasks(previousTasks);
        toast.error("Gagal menyimpan posisi", {
           description: "Terjadi kesalahan pada server. Posisi kartu dikembalikan."
        });
    });
  };

  const handleCreateManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    setIsAddingTask(true);
    const toastId = toast.loading("Menambahkan task...");

    const res = await createManualTask(projectId, {
      title: newTaskTitle,
      description: newTaskDesc,
      assigneeId: newTaskAssignee || null,
    });

    setIsAddingTask(false);
    
    if (res.success) {
      toast.success("Task ditambahkan!", { id: toastId });
      setIsAddModalOpen(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskAssignee("");
    } else {
      toast.error("Gagal menambahkan task", { id: toastId, description: res.error });
    }
  };

  if (!isMounted) return null; // Render placeholder bisa ditaruh di sini

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const progressPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Progress Section */}
      {totalTasks > 0 && (
        <div className="flex flex-col gap-2 px-1">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-slate-700 dark:text-slate-300 font-semibold tracking-tight">Project Progress</span>
            <span className="text-slate-500 font-medium">{doneTasks}/{totalTasks} Tasks ({progressPercentage}%)</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50">
            <div 
              className="h-full bg-linear-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400 transition-all duration-700 ease-in-out rounded-full shadow-[0_0_10px_rgba(52,211,153,0.4)]" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {COLUMNS.map((col) => {
          const colTasks = tasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => a.order - b.order);

          return (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col rounded-2xl border ${col.border} ${
                    col.bg
                  } overflow-hidden min-h-[400px] transition-colors ${
                    snapshot.isDraggingOver ? "bg-slate-100/80 dark:bg-slate-900/80" : ""
                  }`}
                >
                  {/* Column Header */}
                  <div
                    className={`flex items-center justify-between px-4 py-3 ${col.headerBg}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base" aria-hidden="true">
                        {col.emoji}
                      </span>
                      <h2 className={`text-sm font-bold ${col.headerText}`}>
                        {col.label}
                      </h2>
                    </div>
                    <span
                      className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold ${col.countBg} ${col.countText}`}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task List */}
                  <div className="flex flex-col gap-3 p-3 flex-1 overflow-auto overflow-x-hidden min-h-[150px]">
                    {colTasks.length === 0 && !snapshot.isDraggingOver ? (
                      <EmptyColumn label={col.label} />
                    ) : (
                      colTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(prov, snap) => (
                            <TaskCard
                              innerRef={prov.innerRef}
                              draggableProps={prov.draggableProps}
                              dragHandleProps={prov.dragHandleProps}
                              isDragging={snap.isDragging}
                              projectId={projectId}
                              teamMembers={teamMembers}
                              {...task}
                            />
                          )}
                        </Draggable>
                      ))
                    )}
                    {/* Add + Button at bottom of TODO */}
                    {col.id === "TODO" && (
                       <button
                         onClick={() => setIsAddModalOpen(true)}
                         className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium"
                       >
                         <Plus className="w-4 h-4" />
                         Add Task Manually
                       </button>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
        </div>
      </DragDropContext>

      {/* Manual Task Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Manual Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateManualTask} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="e.g. Design Login Page"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                disabled={isAddingTask}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of the task..."
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                disabled={isAddingTask}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee (Optional)</label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                disabled={isAddingTask}
              >
                <option value="">Unassigned</option>
                {teamMembers.map((tm: any) => (
                  <option key={tm.id} value={tm.userId}>
                    {tm.user.name} ({tm.specialty || "Member"})
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={isAddingTask || !newTaskTitle.trim()}>
                {isAddingTask ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
