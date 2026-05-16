"use client";

import { useCallback, useEffect, useState } from "react";

type User = { id: string; email: string; name: string | null };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/auth/me");
    const result = await response.json();
    setUser(response.ok ? result.data.user : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return { user, loading, refresh, logout, isAuthenticated: Boolean(user) };
}
