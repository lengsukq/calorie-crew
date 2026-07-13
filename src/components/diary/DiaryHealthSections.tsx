"use client";

import type { BodyMeasurementEntry } from "@/shared/types";

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
  loadingText,
  children,
}: {
  title: string;
  loading: boolean;
  error: string | null;
  emptyText: string;
  loadingText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card">
      <h2 className="mb-3 text-sm font-bold text-slate-800">{title}</h2>
      {error && <p className="mb-3 text-xs text-red-500">{error}</p>}
      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
          <span className="y2k-spinner h-4 w-4" /> {loadingText}
        </div>
      ) : children ?? (
        <div className="rounded-xl bg-white/40 px-3 py-4 text-center text-sm text-slate-400">{emptyText}</div>
      )}
    </div>
  );
}

function EmptyInline({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-white/40 px-3 py-4 text-center text-sm text-slate-400">{text}</div>
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
      <div className="grid gap-3 md:grid-cols-2">
        <SectionCard
          title="体重记录"
          loading={weight.loading}
          error={weight.error}
          emptyText="这一天还没有体重记录"
          loadingText="正在加载体重记录..."
        >
          {weight.data.length === 0 ? (
            <EmptyInline text="这一天还没有体重记录" />
          ) : (
            <div className="space-y-2">
              {weight.data.map((log) => (
                <div key={log.id} className="list-item flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{Number(log.weightKg).toFixed(1)} kg</p>
                    <p className="text-xs text-slate-400">{log.note || "无备注"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => weight.onRemove(log.id)}
                    className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-500"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="运动记录"
          loading={exercise.loading}
          error={exercise.error}
          emptyText="这一天还没有运动记录"
          loadingText="正在加载运动记录..."
        >
          {exercise.data.length === 0 ? (
            <EmptyInline text="这一天还没有运动记录" />
          ) : (
            <div className="space-y-2">
              {exercise.data.map((log) => (
                <div key={log.id} className="list-item flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{log.exerciseType} · {log.durationMinutes} 分钟</p>
                    <p className="text-xs text-slate-400">{log.caloriesBurned} kcal · {log.note || "无备注"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => exercise.onRemove(log.id)}
                    className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-500"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <SectionCard
          title="饮水记录"
          loading={water.loading}
          error={water.error}
          emptyText="这一天还没有饮水记录"
          loadingText="正在加载饮水记录..."
        >
          {water.data.length === 0 ? (
            <EmptyInline text="这一天还没有饮水记录" />
          ) : (
            <div className="space-y-2">
              {water.data.map((log) => (
                <div key={log.id} className="list-item flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{log.amountMl} ml</p>
                    <p className="text-xs text-slate-400">{log.note || "无备注"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => water.onRemove(log.id)}
                    className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-500"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="睡眠记录"
          loading={sleep.loading}
          error={sleep.error}
          emptyText="这一天还没有睡眠记录"
          loadingText="正在加载睡眠记录..."
        >
          {sleep.data.length === 0 ? (
            <EmptyInline text="这一天还没有睡眠记录" />
          ) : (
            <div className="space-y-2">
              {sleep.data.map((log) => {
                const hours = Math.floor(log.sleepMinutes / 60);
                const minutes = log.sleepMinutes % 60;
                return (
                  <div key={log.id} className="list-item flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{hours} 小时 {minutes} 分钟</p>
                      <p className="text-xs text-slate-400">质量 {log.quality} / 5 · {log.note || "无备注"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => sleep.onRemove(log.id)}
                      className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-500"
                    >
                      删除
                    </button>
                  </div>
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
        loadingText="正在加载身体数据..."
      >
        {bodyMeasurements.data.length === 0 ? (
          <EmptyInline text="这一天还没有身体围度记录" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {bodyMeasurements.data.map((log) => (
              <div key={log.id} className="rounded-xl bg-white/50 px-3 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-medium text-slate-400">记录时间</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{log.logDate}</p>
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  {log.chestCm && <p>胸围: {Number(log.chestCm).toFixed(1)} cm</p>}
                  {log.waistCm && <p>腰围: {Number(log.waistCm).toFixed(1)} cm</p>}
                  {log.hipCm && <p>臀围: {Number(log.hipCm).toFixed(1)} cm</p>}
                  {log.armCm && <p>臂围: {Number(log.armCm).toFixed(1)} cm</p>}
                  {log.legCm && <p>腿围: {Number(log.legCm).toFixed(1)} cm</p>}
                  {log.note && <p className="text-slate-400">{log.note}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => bodyMeasurements.onRemove(log.id)}
                  className="mt-2 rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-500"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}
