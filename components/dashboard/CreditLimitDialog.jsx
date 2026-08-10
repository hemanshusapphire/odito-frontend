"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export function CreditLimitDialog({ open, onClose }) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push("/subscription/plans");
  };

  // Reuses the existing Buy Credits flow, which lives entirely on
  // /settings/subscription (useBuyCreditsFlow.js + the modal it drives) —
  // no separate "Buy Credits" route exists to link to directly, so this
  // navigates to where that flow already is rather than rebuilding it here.
  const handleBuyCredits = () => {
    onClose();
    router.push("/app/settings/subscription");
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-120">

        {/* Body */}
        <div className="px-7 pt-7 pb-6">
          <AlertDialogHeader className="space-y-3 text-left sm:text-left">
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              No Credits Remaining
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
              You don't have any audit credits remaining. Upgrade your plan to
              create a new project and run additional audits.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 px-7 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBuyCredits}
              className="rounded-lg border border-primary/40 bg-transparent px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Buy Credits
            </button>
            <button
              type="button"
              onClick={handleUpgrade}
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #7730ed 0%, #00dfff 100%)" }}
            >
              Upgrade Plan
            </button>
          </div>
        </div>

      </AlertDialogContent>
    </AlertDialog>
  );
}
