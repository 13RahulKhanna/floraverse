const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8000";
const TOKEN_KEY = "floraverse:token";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore — auth will just not persist across reloads in this edge case
  }
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth, headers, ...rest } = options;
  const token = skipAuth ? null : getToken();

  const res = await fetch(`${API_ORIGIN}${path}`, {
    ...rest,
    headers: {
      ...(rest.body && !(rest.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body?.detail ?? message;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new ApiError(res.status, typeof message === "string" ? message : JSON.stringify(message));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function apiUpload<T>(path: string, file: File, extraFields?: Record<string, string>): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) form.append(key, value);
  }
  return apiFetch<T>(path, { method: "POST", body: form });
}

export function assetUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}/${path}`;
}

export { API_ORIGIN };
