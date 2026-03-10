"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";

// ============================================================
// Main Server Actions for Mock Paywall
// ============================================================

export async function createCheckoutLink(teamId: string) {
  try {
    // 1. ASLI: Pemanggilan API Mayar
    // Fetch ini akan error kalau API Key kosong atau limit habis
    const response = await fetch("https://api.mayar.id/v1/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAYAR_API_KEY || "dummy-key"}`, // Ganti dengan key asli jika ada
      },
      body: JSON.stringify({
        name: "SyncTask Pro Workspace",
        description: "Upgrade ke Pro Workspace: Unlocked all features",
        amount: 50000,
        currency: "IDR",
      }),
    });

    if (!response.ok) {
      // API Mayar gagal (misal 401 Unauthorized karena belum ada API key)
      console.warn("Mayar API error, using fallback mock checkout.");
      return { url: `/mock-checkout?teamId=${teamId}` };
    }

    const data = await response.json();
    return { url: data.link }; // Sesuaikan dengan response body Mayar yang asli (contoh: data.link atau data.data.url)
  } catch (error) {
    console.error("Failed to connect to Mayar APIs", error);
    // 2. FALLBACK: Jika fetch gagal total (misal timeout)
    return { url: `/mock-checkout?teamId=${teamId}` };
  }
}

export async function confirmMockPayment(teamId: string) {
  try {
    await prisma.team.update({
      where: { id: teamId },
      data: { planStatus: "PRO" },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update plan status:", error);
    return { success: false, error: "Gagal memperbarui status plan proyek." };
  }
}
