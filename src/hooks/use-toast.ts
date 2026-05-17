"use client";

import { useCallback, useState } from "react";

export type ToastState = {
  message: string;
  type?: "success" | "error" | "info";
} | null;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  return { toast, showToast, clearToast: () => setToast(null) };
}
