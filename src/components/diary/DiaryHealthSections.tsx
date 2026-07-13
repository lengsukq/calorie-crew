"use client";

import { Trash2 } from "lucide-react";
import type { BodyMeasurementEntry } from "@/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DiaryHealthSectionEntry<T> {
  id: string;
  data: T[];
  loading: boolean;
  error: string | null;
  onRemove: (id: string) => void;
}

export interface DiaryHealthSectionsProps {
  weight: DiaryHealthSectionEntry<{ id: string; weightKg: string; note: string | null; logDate: string }>;
  exercise: DiaryHealthSectionEntry<{ id: string; exerciseType: string; durationMinutes: number; caloriesBurned: number; note: string | null }>;
  water: DiaryHealthSectionEntry<{ id: string; amountMl: number; note: string | null }>;
  sleep: DiaryHealthSectionEntry<{ id: string; sleepMinutes: number; quality: number; note: string | null }>;
  bodyMeasurements: DiaryHealthSectionEntry<BodyMeasurementEntry>;
}

function SectionCard({
  title,
  loading,
  error,
  emptyText,
  loadingSkeletonRows = 2,
  children,
}: {
  title: string;
  loading: boolean;
  error: string | null;
  emptyText: string;
  loadingSkeletonRows?: number;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-xs text-destructive">{error}</p>}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: loadingSkeletonRows }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : children ?? (
          <p className="rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground">
            {emptyText}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyInline({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

function RemovableRow({
  title,
  subtitle,
  onRemove,
}: {
  title: string;
  subtitle: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        aria-label="删除"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function DiaryHealthSections({
  weight,
  exercise,
  water,
  sleep,
  bodyMeasurements,
}: DiaryHealthSectionsProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="体重记录"
          loading={weight.loading}
          error={weight.error}
          emptyText="这一天还没有体重记录"
        >
          {weight.data.length === 0 ? (
            <EmptyInline text="这一天还没有体重记录" />
          ) : (
            <div className="space-y-2">
              {weight.data.map((log) => (
                <RemovableRow
                  key={log.id}
                  title={`${Number(log.weightKg).toFixed(1)} kg`}
                  subtitle={log.note || "无备注"}
                  onRemove={() => weight.onRemove(log.id)}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="运动记录"
          loading={exercise.loading}
          error={exercise.error}
          emptyText="这一天还没有运动记录"
        >
          {exercise.data.length === 0 ? (
            <EmptyInline text="这一天还没有运动记录" />
          ) : (
            <div className="space-y-2">
              {exercise.data.map((log) => (
                <RemovableRow
                  key={log.id}
                  title={`${log.exerciseType} · ${log.durationMinutes} 分钟`}
                  subtitle={`${log.caloriesBurned} kcal · ${log.note || "无备注"}`}
                  onRemove={() => exercise.onRemove(log.id)}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="饮水记录"
          loading={water.loading}
          error={water.error}
          emptyText="这一天还没有饮水记录"
        >
          {water.data.length === 0 ? (
            <EmptyInline text="这一天还没有饮水记录" />
          ) : (
            <div className="space-y-2">
              {water.data.map((log) => (
                <RemovableRow
                  key={log.id}
                  title={`${log.amountMl} ml`}
                  subtitle={log.note || "无备注"}
                  onRemove={() => water.onRemove(log.id)}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="睡眠记录"
          loading={sleep.loading}
          error={sleep.error}
          emptyText="这一天还没有睡眠记录"
        >
          {sleep.data.length === 0 ? (
            <EmptyInline text="这一天还没有睡眠记录" />
          ) : (
            <div className="space-y-2">
              {sleep.data.map((log) => {
                const hours = Math.floor(log.sleepMinutes / 60);
                const minutes = log.sleepMinutes % 60;
                return (
                  <RemovableRow
                    key={log.id}
                    title={`${hours} 小时 ${minutes} 分钟`}
                    subtitle={`质量 ${log.quality} / 5 · ${log.note || "无备注"}`}
                    onRemove={() => sleep.onRemove(log.id)}
                  />
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="身体围度"
        loading={bodyMeasurements.loading}
        error={bodyMeasurements.error}
        emptyText="这一天还没有身体围度记录"
      >
        {bodyMeasurements.data.length === 0 ? (
          <EmptyInline text="这一天还没有身体围度记录" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {bodyMeasurements.data.map((log) => (
              <div key={log.id} className="rounded-lg border bg-card p-3">
                <p className="text-[11px] text-muted-foreground">记录时间</p>
                <p className="mt-1 text-sm font-medium text-foreground tabular-nums">{log.logDate}</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {log.chestCm && <p>胸围 {Number(log.chestCm).toFixed(1)} cm</p>}
                  {log.waistCm && <p>腰围 {Number(log.waistCm).toFixed(1)} cm</p>}
                  {log.hipCm && <p>臀围 {Number(log.hipCm).toFixed(1)} cm</p>}
                  {log.armCm && <p>臂围 {Number(log.armCm).toFixed(1)} cm</p>}
                  {log.legCm && <p>腿围 {Number(log.legCm).toFixed(1)} cm</p>}
                  {log.note && <p className="text-muted-foreground/70">{log.note}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 px-2 text-muted-foreground hover:text-destructive"
                  onClick={() => bodyMeasurements.onRemove(log.id)}
                >
                  删除
                </Button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}
