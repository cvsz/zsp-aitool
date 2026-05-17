"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiClientError, apiClient } from "@/lib/api-client";

export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextData = await apiClient.get<T>(path);
      setData(nextData);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "โหลดข้อมูลไม่สำเร็จ";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
