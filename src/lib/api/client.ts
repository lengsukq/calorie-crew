export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    "content-type": "application/json",
  };

  // Merge custom headers without overriding content-type via spread order bug
  if (options?.headers) {
    const customHeaders = options.headers as Record<string, string>;
    for (const key of Object.keys(customHeaders)) {
      defaultHeaders[key] = customHeaders[key];
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new ApiError(body.error ?? `请求失败 (${response.status})`, response.status);
  }

  return response.json() as Promise<T>;
}

export { todayDate } from "@/lib/date";
