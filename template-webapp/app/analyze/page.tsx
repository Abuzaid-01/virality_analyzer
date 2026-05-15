"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { FileUpload } from "@/components/file-upload"
import { AnalyzingState } from "@/components/analyzing-state"
import { AnalysisResults } from "@/components/analysis-results"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import {
  uploadContent,
  analyzeContent,
  type Platform,
  type ViralityAnalysis,
} from "@/lib/api"
import { toast } from "sonner"
import { Sparkles, Lock } from "lucide-react"

type AnalysisStep = "upload" | "analyzing" | "results"

export default function AnalyzePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { isPro } = useSubscription()
  const router = useRouter()

  const [step, setStep] = useState<AnalysisStep>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [caption, setCaption] = useState("")
  const [platform, setPlatform] = useState<Platform>("tiktok")
  const [niche, setNiche] = useState("")
  const [analysis, setAnalysis] = useState<ViralityAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = useCallback(async () => {
    if (!file) return
    if (!user) {
      router.push("/auth/login?returnUrl=/analyze")
      return
    }

    setError(null)

    try {
      // Step 1: Upload
      setIsUploading(true)
      const uploadResult = await uploadContent(file)
      setIsUploading(false)

      // Step 2: Analyze
      setStep("analyzing")
      const analysisResult = await analyzeContent({
        upload_id: uploadResult.upload_id,
        caption: caption || undefined,
        platform,
        niche: niche || undefined,
      })

      // Step 3: Show results
      setAnalysis(analysisResult)
      setStep("results")
      toast.success(`Virality Score: ${analysisResult.virality_score}/100`)

    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed"
      setError(message)
      toast.error(message)
      setStep("upload")
      setIsUploading(false)
    }
  }, [file, user, caption, platform, niche, router])

  const handleNewAnalysis = useCallback(() => {
    setStep("upload")
    setFile(null)
    setCaption("")
    setNiche("")
    setAnalysis(null)
    setError(null)
  }, [])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Sign in to analyze</h1>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Create a free account to upload your content and get AI-powered virality insights.
          </p>
          <div className="flex gap-3">
            <Button size="lg" onClick={() => router.push("/auth/login?returnUrl=/analyze")}>
              Sign In
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/auth/signup?returnUrl=/analyze")}>
              Create Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">

        {/* ── Upload Step ──────────────────────────────────────────────── */}
        {step === "upload" && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Analysis
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Analyze Your Content
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload your video or image and get an AI virality score with specific,
                actionable feedback to maximize reach.
              </p>
            </div>

            {/* Upload area */}
            <FileUpload
              file={file}
              onFileSelect={setFile}
              onClear={() => setFile(null)}
              isUploading={isUploading}
            />

            {/* Form fields */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Platform */}
              <div className="space-y-2">
                <Label htmlFor="platform">Target Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                  <SelectTrigger id="platform" className="bg-card/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube_shorts">YouTube Shorts</SelectItem>
                    <SelectItem value="twitter">X (Twitter)</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Niche */}
              <div className="space-y-2">
                <Label htmlFor="niche">Content Niche <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="niche"
                  placeholder="e.g. fitness, cooking, tech"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="bg-card/30"
                />
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption">
                Post Caption <span className="text-muted-foreground font-normal">(optional — AI will optimize it)</span>
              </Label>
              <textarea
                id="caption"
                rows={4}
                placeholder="Paste your caption or write one here... AI will score and optimize it."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-card/30 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                maxLength={2200}
              />
              {caption && (
                <p className="text-xs text-muted-foreground text-right">{caption.length}/2200</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                className="px-10 py-6 text-base"
                disabled={!file || isUploading}
                onClick={handleAnalyze}
              >
                {isUploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Viral Potential
                  </>
                )}
              </Button>
              {!isPro && (
                <p className="text-xs text-muted-foreground">
                  Free tier: limited analyses · <button onClick={() => router.push("/upgrade")} className="text-primary hover:underline">Upgrade to Pro</button> for unlimited
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Analyzing Step ───────────────────────────────────────────── */}
        {step === "analyzing" && <AnalyzingState />}

        {/* ── Results Step ─────────────────────────────────────────────── */}
        {step === "results" && analysis && (
          <AnalysisResults analysis={analysis} onNewAnalysis={handleNewAnalysis} />
        )}
      </div>
    </div>
  )
}
