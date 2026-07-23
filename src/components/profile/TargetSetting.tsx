"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Target, Droplets, Moon, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TargetSettingProps {
  calorieTarget: number;
  waterTargetMl: number;
  sleepTargetMinutes: number;
  onUpdateCalorie: (target: number) => Promise<boolean>;
  onUpdateWater: (target: number) => Promise<boolean>;
  onUpdateSleep: (target: number) => Promise<boolean>;
}

interface TargetRowConfig {
  key: string;
  icon: LucideIcon;
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  format?: (value: number) => string;
  onUpdate: (target: number) => Promise<boolean>;
}

function TargetRow({ icon: Icon, label, unit, min, max, step, value, format, onUpdate }: TargetRowConfig) {
  const [draft, setDraft] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (Number.isNaN(draft) || draft < min || draft > max) {
      toast.error(`${label}需在 ${min}-${max} 之间`);
      return;
    }
    setSaving(true);
    try {
      const success = await onUpdate(draft);
      if (success) {
        setIsEditing(false);
        toast.success(`${label}已更新`);
      } else {
        toast.error("更新失败");
      }
    } catch {
      toast.error("更新失败");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(value);
    setIsEditing(false);
  }

  const displayValue = format ? format(value) : `${value}`;

  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={min}
            max={max}
            step={step}
            value={draft}
            onChange={(e) => setDraft(Number(e.target.value))}
            className="h-8 w-24"
            autoFocus
          />
          <span className="text-xs text-muted-foreground">{unit}</span>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            取消
          </Button>
          <Button size="sm" disabled={saving} onClick={handleSave}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold tabular-nums text-foreground">
            {displayValue}
            <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => {
              setDraft(value);
              setIsEditing(true);
            }}
          >
            修改
          </Button>
        </div>
      )}
    </div>
  );
}

function formatSleepMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}小时${rest}分` : `${hours}小时`;
}

export function TargetSetting({
  calorieTarget,
  waterTargetMl,
  sleepTargetMinutes,
  onUpdateCalorie,
  onUpdateWater,
  onUpdateSleep,
}: TargetSettingProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">每日目标</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="divide-y">
        <TargetRow
          key="calorie"
          icon={Target}
          label="热量目标"
          unit="kcal"
          min={500}
          max={10000}
          value={calorieTarget}
          onUpdate={onUpdateCalorie}
        />
        <TargetRow
          key="water"
          icon={Droplets}
          label="饮水目标"
          unit="ml"
          min={100}
          max={10000}
          step={100}
          value={waterTargetMl}
          onUpdate={onUpdateWater}
        />
        <TargetRow
          key="sleep"
          icon={Moon}
          label="睡眠目标"
          unit=""
          min={60}
          max={1440}
          step={15}
          value={sleepTargetMinutes}
          format={formatSleepMinutes}
          onUpdate={onUpdateSleep}
        />
      </CardContent>
    </Card>
  );
}
