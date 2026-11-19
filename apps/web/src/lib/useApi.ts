import { useEffect, useState, useCallback } from "react";
import { apiFetch, ApiError } from "./api";

export function useApi<T>(path: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(path);
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [path, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps -- deps is a deliberate extra dependency list

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
