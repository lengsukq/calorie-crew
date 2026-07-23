import { ApiError } from "@/lib/api/client";

export type ExportFormat = "csv" | "json";

interface ExportOptions {
  format: ExportFormat;
  from?: string;
  to?: string;
}

/**
 * Fetch the export file and trigger a browser download.
 * Returns the number of bytes downloaded.
 */
export async function downloadExport({ format, from, to }: ExportOptions): Promise<void> {
  const params = new URLSearchParams({ format });
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const response = await fetch(`/api/export?${params.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(body.error ?? `导出失败 (${response.status})`, response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `calorie-crew-export-${from ?? "all"}-${to ?? "today"}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
