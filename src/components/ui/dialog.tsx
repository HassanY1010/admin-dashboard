"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 z-50">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
}

export function DialogDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

export function DialogFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex justify-end gap-2 mt-6", className)}>{children}</div>;
}