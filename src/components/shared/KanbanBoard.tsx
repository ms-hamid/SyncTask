"use client";

import React, { useState, useEffect, startTransition } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { TaskCard, TaskCardProps } from "./TaskCard";
import { updateTaskOrder } from "../../actions/project";
import { toast } from "sonner";

export type TaskStatus = "TODO" | "DOING" | "DONE";

export interface KanbanTask extends Omit<TaskCardProps, "status"> {
  id: string;
  status: TaskStatus;
  order: number;
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
export function KanbanBoard({ tasks: initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [isMounted, setIsMounted] = useState(false);

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

    // Gunakan startTransition agar frame browser tidak freeze saat API call jalan di background
    startTransition(async () => {
      try {
        const res = await updateTaskOrder(payload);
        if (!res.success) {
          throw new Error(res.error || "Gagal mengatur urutan.");
        }
      } catch (error) {
        // Jika server gagal (misal koneksi putus), kembalikan kartu ke posisi awal (Rollback)
        setTasks(previousTasks);
        toast.error("Gagal menyimpan posisi. Terjadi kesalahan pada server. Posisi kartu dikembalikan.");
      }
    });
  };

  if (!isMounted) return null; // Render placeholder bisa ditaruh di sini

  return (
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
                              {...task}
                            />
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
