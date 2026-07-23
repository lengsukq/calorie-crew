import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { todayDate } from "@/lib/date";
import { localDateStringSchema } from "@/lib/validation/food-log";
import { buildExportCsv, getExportData } from "@/lib/services/export.service";
import { z } from "zod";

const EXPORT_FORMATS = ["csv", "json"] as const;
type ExportFormat = (typeof EXPORT_FORMATS)[number];

const exportQuerySchema = z.object({
  format: z.enum(EXPORT_FORMATS).default("csv"),
  from: localDateStringSchema.optional(),
  to: localDateStringSchema.optional(),
});

const DEFAULT_FROM = "2000-01-01";
const STREAM_CHUNK_SIZE = 16 * 1024;

function streamCsv(csv: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let offset = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset >= csv.length) {
        controller.close();
        return;
      }
      const nextOffset = Math.min(offset + STREAM_CHUNK_SIZE, csv.length);
      controller.enqueue(encoder.encode(csv.slice(offset, nextOffset)));
      offset = nextOffset;
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const params = new URL(request.url).searchParams;
  const parsed = exportQuerySchema.safeParse({
    format: params.get("format") ?? undefined,
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
  });
  if (!parsed.success) return jsonError("导出参数不正确", 400);

  const format: ExportFormat = parsed.data.format;
  const to = parsed.data.to ?? todayDate();
  const from = parsed.data.from ?? DEFAULT_FROM;
  if (from > to) return jsonError("开始日期不能晚于结束日期", 400);

  return withRouteError(async () => {
    const data = await getExportData(userIdOrError, { from, to });
    const filename = `calorie-crew-export-${from}-${to}.${format}`;
    const disposition = `attachment; filename="${filename}"`;

    if (format === "json") {
      return new Response(JSON.stringify(data, null, 2), {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "content-disposition": disposition,
        },
      });
    }

    const csv = buildExportCsv(data);
    return new Response(streamCsv(csv), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": disposition,
      },
    });
  }, "导出数据失败");
}
