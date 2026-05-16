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
import { Sparkles, Lock, Zap } from "lucide-react"

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
          <div className="glass rounded-3xl p-12 max-w-md w-full text-center glow-violet">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Sign in to analyze</h1>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Create a free account to upload your content and get AI-powered virality insights.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                size="lg"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 border-0"
                onClick={() => router.push("/auth/login?returnUrl=/analyze")}
              >
                Sign In
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl glass border-white/10"
                onClick={() => router.push("/auth/signup?returnUrl=/analyze")}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl relative z-10">

        {/* ── Upload Step ──────────────────────────────────────────────── */}
        {step === "upload" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border-violet-500/20 text-violet-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Analysis
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Analyze Your
                <span className="gradient-text"> Content</span>
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
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Platform */}
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-sm font-medium">Target Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                  <SelectTrigger id="platform" className="glass rounded-xl border-white/[0.06] h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass rounded-xl border-white/[0.06]">
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
                <Label htmlFor="niche" className="text-sm font-medium">Content Niche <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="niche"
                  placeholder="e.g. fitness, cooking, tech"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="glass rounded-xl border-white/[0.06] h-11"
                />
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-sm font-medium">
                Post Caption <span className="text-muted-foreground font-normal">(optional — AI will optimize it)</span>
              </Label>
              <textarea
                id="caption"
                rows={4}
                placeholder="Paste your caption or write one here... AI will score and optimize it."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full rounded-xl glass border-white/[0.06] px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none transition-all"
                maxLength={2200}
              />
              {caption && (
                <p className="text-xs text-muted-foreground text-right">{caption.length}/2200</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/15 p-4 text-sm text-rose-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                className="px-12 py-7 text-base rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 transition-all duration-300 border-0"
                disabled={!file || isUploading}
                onClick={handleAnalyze}
              >
                {isUploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze Viral Potential
                  </>
                )}
              </Button>
              {!isPro && (
                <p className="text-xs text-muted-foreground">
                  Free tier: limited analyses · <button onClick={() => router.push("/upgrade")} className="text-violet-400 hover:text-violet-300 hover:underline transition-colors">Upgrade to Pro</button> for unlimited
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
