const isDev = process.env.NODE_ENV !== 'production';

/**
 * Returns a safe error response body.
 * In production the `details` field is omitted to avoid leaking
 * internal paths, query text, or stack traces to clients.
 */
export function apiError(
  message: string,
  error?: unknown,
  status = 500
): { body: Record<string, unknown>; status: number } {
  const body: Record<string, unknown> = { error: message };
  if (isDev && error) {
    body.details = error instanceof Error ? error.message : String(error);
  }
  return { body, status };
}
