"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";

export async function createManualTask(
  projectId: string,
  data: {
    title: string;
    description: string;
    assigneeId: string | null;
  }
): Promise<{ success: boolean; task?: any; error?: string }> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: { select: { order: true } } },
    });

    if (!project) {
      return { success: false, error: "Project tidak ditemukan" };
    }

    const maxOrder =
      project.tasks.length > 0
        ? Math.max(...project.tasks.map((t) => t.order)) + 1
        : 0;

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: "TODO",
        order: maxOrder,
        effortScore: 1, // Default effort for manual task
        projectId: projectId,
        assigneeId: data.assigneeId,
      },
    });

    revalidatePath(`/project/${projectId}`);
    return { success: true, task };
  } catch (error: any) {
    console.error("[createManualTask] Error:", error);
    return { success: false, error: "Gagal membuat task manual" };
  }
}

export async function updateTaskDetails(
  taskId: string,
  data: {
    title: string;
    description: string;
    assigneeId: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
      },
    });

    revalidatePath(`/project/${updated.projectId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[updateTaskDetails] Error:", error);
    return { success: false, error: "Gagal memperbarui task" };
  }
}

export async function deleteTask(
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return { success: false, error: "Task tidak ditemukan" };

    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath(`/project/${task.projectId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[deleteTask] Error:", error);
    return { success: false, error: "Gagal menghapus task" };
  }
}
