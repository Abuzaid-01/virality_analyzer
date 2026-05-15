"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { AnalysisResults } from "@/components/analysis-results"
import { useAuth } from "@/contexts/auth-context"
import { getAnalysis, type ViralityAnalysis } from "@/lib/api"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

type Params = Promise<{ id: string }>

export default function AnalysisDetailPage({ params }: { params: Params }) {
  const { id } = use(params)
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<ViralityAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user) return

    const fetchAnalysis = async () => {
      try {
        const data = await getAnalysis(id)
        setAnalysis(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analysis")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [id, user, authLoading])

  if (!authLoading && !user) {
    router.push("/auth/login?returnUrl=/dashboard")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-muted-foreground"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        ) : analysis ? (
          <AnalysisResults
            analysis={analysis}
            onNewAnalysis={() => router.push("/analyze")}
          />
        ) : null}
      </div>
    </div>
  )
}
