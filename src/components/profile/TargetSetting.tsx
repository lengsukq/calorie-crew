"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TargetSettingProps {
  currentTarget: number;
  onUpdate: (target: number) => Promise<boolean>;
}

export function TargetSetting({ currentTarget, onUpdate }: TargetSettingProps) {
  const [value, setValue] = useState(currentTarget);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (value < 500 || value > 10000) {
      toast.error("目标需在 500-10000 之间");
      return;
    }
    setSaving(true);
    try {
      const success = await onUpdate(value);
      if (success) {
        setIsEditing(false);
        toast.success("目标已更新");
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
    setValue(currentTarget);
    setIsEditing(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">每日热量目标</CardTitle>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>取消</Button>
            <Button size="sm" disabled={saving} onClick={handleSave}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => setIsEditing(true)}>
            修改
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label htmlFor="calorie-target">热量目标</Label>
              <Input
                id="calorie-target"
                type="number"
                min="500"
                max="10000"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                autoFocus
              />
            </div>
            <span className="text-sm text-muted-foreground mt-6">kcal</span>
          </div>
        ) : (
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {currentTarget}
              <span className="ml-1 text-sm font-normal text-muted-foreground">kcal</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
