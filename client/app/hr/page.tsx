"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban, Users, Percent, Loader2, Plus, ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHrAuth } from "@/lib/hr-auth-context";
import { getHrDashboardStats, listScreeningBatches, type HrDashboardStats, type ScreeningBatch } from "@/lib/api";

const DISTRIBUTION_COLORS: Record<string, string> = {
  "80-100": "#22c55e",
  "60-80": "#3b82f6",
  "40-60": "#f59e0b",
  "20-40": "#f97316",
  "0-20": "#ef4444",
};

export default function HrDashboardPage() {
  const { hrUser, callAuthed } = useHrAuth();
  const [stats, setStats] = React.useState<HrDashboardStats | null>(null);
  const [recentBatches, setRecentBatches] = React.useState<ScreeningBatch[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [statsRes, batchesRes] = await Promise.all([
          callAuthed((token) => getHrDashboardStats(token)),
          callAuthed((token) => listScreeningBatches(token)),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setRecentBatches(batchesRes.data.slice(0, 5));
      } catch {
        if (!cancelled) setError("Couldn't load your dashboard. Please refresh.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [callAuthed]);

  const distributionData = stats
    ? Object.entries(stats.scoreDistribution)
        .map(([range, count]) => ({ range, count }))
        .filter((d) => d.count > 0)
    : [];
  const totalScored = distributionData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back{hrUser ? `, ${hrUser.email.split("@")[0]}` : ""} 👋
        </h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your hiring pipeline.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                key: "totalBatches",
                label: "Batches Created",
                icon: FolderKanban,
                className: "bg-primary/10 text-primary",
                value: (stats: HrDashboardStats | null) => stats?.totalBatches ?? 0,
              },
              {
                key: "candidatesScreened",
                label: "Candidates Screened",
                icon: Users,
                className: "bg-blue-500/10 text-blue-500",
                value: (stats: HrDashboardStats | null) => stats?.candidatesScreened ?? 0,
              },
              {
                key: "averageMatchScore",
                label: "Average Match Score",
                icon: Percent,
                className: "bg-success/10 text-success",
                value: (stats: HrDashboardStats | null) => `${stats?.averageMatchScore ?? 0}%`,
              },
            ].map((card, index) => (
              <Card
                key={card.key}
                className="animate-card-rise border-0 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <CardContent className="p-5">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${card.className}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{card.value(stats)}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Screening Batches</h2>
                <Button asChild size="sm">
                  <Link href="/hr/batches">
                    <Plus className="h-4 w-4" /> New Batch
                  </Link>
                </Button>
              </div>

              {recentBatches.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-12 text-center">
                    <FolderKanban className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="mb-1 font-semibold text-foreground">No screening batches yet</p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Create a batch, paste a job description, and start uploading resumes to screen.
                    </p>
                    <Button asChild>
                      <Link href="/hr/batches">
                        <Plus className="h-4 w-4" /> Create Your First Batch
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {recentBatches.map((batch, index) => (
                    <Link key={batch.id} href={`/hr/batches/${batch.id}`}>
                      <Card className="animate-card-rise transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg" style={{ animationDelay: `${index * 80}ms` }}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="font-medium text-foreground">{batch.jobTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {batch._count?.candidates ?? 0} candidates · Created{" "}
                              {new Date(batch.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Score Distribution — real bucket counts across every
                screened resume in the organization, not decorative */}
            <Card>
              <CardContent className="p-6">
                <p className="mb-4 font-semibold text-foreground">Score Distribution</p>
                {totalScored === 0 ? (
                  <p className="text-sm text-muted-foreground">No scored candidates yet.</p>
                ) : (
                  <>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distributionData}
                            dataKey="count"
                            nameKey="range"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={2}
                          >
                            {distributionData.map((d) => (
                              <Cell key={d.range} fill={DISTRIBUTION_COLORS[d.range]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {distributionData.map((d) => (
                        <div key={d.range} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: DISTRIBUTION_COLORS[d.range] }}
                            />
                            {d.range}%
                          </span>
                          <span className="font-medium text-foreground">
                            {Math.round((d.count / totalScored) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
