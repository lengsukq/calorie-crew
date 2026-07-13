"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminPanelProps {
  onCreateInvite: (maxUses: number) => Promise<string | null>;
}

export function AdminPanel({ onCreateInvite }: AdminPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [maxUses, setMaxUses] = useState(1);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const code = await onCreateInvite(maxUses);
      if (code) {
        setInviteCode(code);
        toast.success("邀请码已创建");
      } else {
        toast.error("创建失败");
      }
    } catch {
      toast.error("创建邀请码失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">邀请码管理</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? "收起" : "展开"}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="invite-uses">可使用次数</Label>
              <Input
                id="invite-uses"
                type="number"
                min="1"
                max="1000"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "生成中..." : "生成邀请码"}
            </Button>
          </div>
          {inviteCode && (
            <div className="rounded-lg border bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">邀请码</p>
              <code className="mt-1 block text-sm font-mono font-semibold text-foreground">{inviteCode}</code>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
