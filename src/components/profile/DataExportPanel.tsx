"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileJson } from "lucide-react";
import { downloadExport, type ExportFormat } from "@/lib/api/export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DataExportPanel() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    if (from && to && from > to) {
      toast.error("开始日期不能晚于结束日期");
      return;
    }
    setExporting(format);
    try {
      await downloadExport({
        format,
        from: from || undefined,
        to: to || undefined,
      });
      toast.success("导出成功，已开始下载");
    } catch (err) {
      const message = err instanceof Error ? err.message : "导出失败";
      toast.error(message);
    } finally {
      setExporting(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">导出数据</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          导出指定日期范围内的饮食、体重、运动、饮水、睡眠与身体数据。留空则导出全部记录。
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="export-from" className="text-xs">开始日期</Label>
            <Input id="export-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="export-to" className="text-xs">结束日期</Label>
            <Input id="export-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={exporting !== null} onClick={() => handleExport("csv")}>
            <FileSpreadsheet className="h-4 w-4" />
            {exporting === "csv" ? "导出中..." : "导出 CSV"}
          </Button>
          <Button variant="outline" className="flex-1" disabled={exporting !== null} onClick={() => handleExport("json")}>
            <FileJson className="h-4 w-4" />
            {exporting === "json" ? "导出中..." : "导出 JSON"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
