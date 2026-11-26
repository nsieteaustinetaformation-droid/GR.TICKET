export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function fail(error: string, status = 400, details?: unknown): Response {
  return Response.json({ ok: false, error, ...(details ? { details } : {}) }, { status });
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
