"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { listAnalyses } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ScoreRing } from "@/components/score-ring"
import { Loader2, Plus, Clock, BarChart3, Lock } from "lucide-react"

type AnalysisRecord = {
  id: string
  upload_id: string
  virality_score: number
  one_line_verdict: string
  platform: string
  created_at: string
  processing_time_seconds: number
  niche?: string
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400"
  if (score >= 60) return "text-yellow-400"
  if (score >= 40) return "text-orange-400"
  return "text-red-400"
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalyses = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await listAnalyses(20)
      setAnalyses(data as unknown as AnalysisRecord[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && user) {
      fetchAnalyses()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user, fetchAnalyses])

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Sign in to view dashboard</h1>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Your analysis history and dashboard are available after signing in.
          </p>
          <Button size="lg" onClick={() => router.push("/auth/login?returnUrl=/dashboard")}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your content analysis history</p>
          </div>
          <Button onClick={() => router.push("/analyze")}>
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={fetchAnalyses}>Retry</Button>
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <BarChart3 className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No analyses yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload your first video or image to get an AI-powered virality analysis.
            </p>
            <Button onClick={() => router.push("/analyze")}>
              <Plus className="w-4 h-4 mr-2" />
              Analyze Content
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-border/50 bg-card/30 p-5 flex items-center gap-5 hover:bg-card/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/${a.id}`)}
              >
                {/* Score */}
                <ScoreRing score={a.virality_score} size={64} strokeWidth={5} showLevel={false} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {a.one_line_verdict || `Score: ${a.virality_score}/100`}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground capitalize">{a.platform}</span>
                    {a.niche && <span className="text-xs text-muted-foreground">· {a.niche}</span>}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(a.created_at)}
                    </span>
                  </div>
                </div>

                {/* Score text */}
                <span className={`text-2xl font-bold tabular-nums ${getScoreColor(a.virality_score)}`}>
                  {a.virality_score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
