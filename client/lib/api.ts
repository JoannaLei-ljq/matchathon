const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api';
const TOKEN_KEY = 'matchathon.token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be unavailable (private mode); the session just won't persist.
  }
}

export class ApiError extends Error {
  status: number;
  details?: { field: string; message: string }[];

  constructor(status: number, message: string, details?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.details = details;
  }

  /** Map of field name → message, for showing errors next to form inputs. */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries((this.details ?? []).map((d) => [d.field, d.message]));
  }
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown };

export async function api<T>(path: string, { body, headers, ...init }: Options = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Is the API running?");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? 'Something went wrong.', data.details);
  }
  return data as T;
}
