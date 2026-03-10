import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Rocket, ShieldCheck } from "lucide-react";
import { confirmMockPayment } from "@/src/actions/payment";

export default function MockCheckoutPage({
  searchParams,
}: {
  searchParams: { teamId?: string };
}) {
  const teamId = searchParams.teamId || "team-mvp-001";

  async function handlePayment(formData: FormData) {
    "use server";
    const result = await confirmMockPayment(teamId);
    if (result.success) {
      redirect("/");
    } else {
      // Fallback redirect even if there's an issue for MVP continuity
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center pb-2 bg-slate-100 dark:bg-slate-900 rounded-t-xl border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
              <Rocket className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">SyncTask Pro</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
            (Simulasi Checkout untuk Keperluan Hackathon)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-6">
          <div className="space-y-4">
             <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
               <span className="text-slate-600 dark:text-slate-300">Paket</span>
               <span className="font-semibold text-slate-900 dark:text-white">Pro Workspace (Bulanan)</span>
             </div>
             <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
               <span className="text-slate-600 dark:text-slate-300">Harga</span>
               <span className="font-semibold text-slate-900 dark:text-white">Rp 50.000</span>
             </div>
             
             <div className="pt-4 space-y-3">
                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Unlimited Projects & Tasks</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Advanced AI Generation Features</span>
                </div>
             </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2 pb-6 px-6">
          <form action={handlePayment} className="w-full">
            <Button 
              type="submit" 
              className="w-full h-12 text-md font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all"
            >
              Bayar & Aktifkan Pro
            </Button>
          </form>
          <div className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 gap-1.5 pt-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Simulasi Pembayaran Terenkripsi</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
