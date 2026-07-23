"use client";

import { Trophy, Lock } from "lucide-react";
import { useEngagement } from "@/hooks/useEngagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function AchievementsPanel() {
  const { data, loading } = useEngagement();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">成就徽章</CardTitle>
        </div>
        {data && (
          <span className="text-xs text-muted-foreground tabular-nums">
            已解锁 {data.achievements.filter((a) => a.unlocked).length} / {data.achievements.length}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {data?.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  achievement.unlocked ? "border-primary/20 bg-primary/5" : "opacity-70"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {achievement.unlocked ? <Trophy className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{achievement.title}</p>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {achievement.progress} / {achievement.target}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <Progress className="mt-1.5 h-1.5" value={(achievement.progress / achievement.target) * 100} max={100} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
