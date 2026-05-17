import { supabase } from "@/lib/supabase/client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function getAuthHeaders(): Promise<Record<string, string>> {
  console.log("[API] Getting auth headers...")
  try {
    // Race getSession against a 3-second timeout so it never hangs forever
    const sessionResult = await Promise.race([
      supabase.auth.getSession(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ])

    if (sessionResult && typeof sessionResult === "object" && "data" in sessionResult) {
      const session = (sessionResult as { data: { session: { access_token: string } | null } }).data.session
      if (session?.access_token) {
        console.log("[API] Got access token:", session.access_token.substring(0, 20) + "...")
        return { Authorization: `Bearer ${session.access_token}` }
      }
    }

    console.warn("[API] No session found or timed out — sending request without auth")
    return {}
  } catch (err) {
    console.warn("[API] Auth error, proceeding without auth:", err)
    return {}
  }
}

// ── Types matching the Python backend response models ─────────────────────────

export type VisualAnalysis = {
  thumbnail_score: number
  thumbnail_feedback: string
  hook_score: number
  hook_feedback: string
  visual_quality_score: number
  visual_quality_feedback: string
  pacing_score: number
  pacing_feedback: string
  detected_text_on_screen: string[]
  detected_emotions: string[]
  scene_descriptions: string[]
}

export type TrendAnalysis = {
  trend_alignment_score: number
  trend_summary: string
  trending_hashtags: string[]
  trending_audio_suggestions: string[]
  competitor_insights: string | null
  best_posting_times: string[]
  platform_specific_tips: string[]
}

export type CaptionAnalysis = {
  caption_score: number
  hook_text_score: number
  cta_present: boolean
  cta_strength: string | null
  emotion_triggers: string[]
  optimized_caption: string
  optimized_hook: string
  hashtag_suggestions: string[]
}

export type ImprovementPlan = {
  priority_fixes: string[]
  quick_wins: string[]
  deep_improvements: string[]
  what_works: string[]
  predicted_score_after_fixes: number
}

export type ViralityAnalysis = {
  analysis_id: string
  upload_id: string
  created_at: string
  virality_score: number
  virality_level: "poor" | "average" | "good" | "viral"
  one_line_verdict: string
  visual: VisualAnalysis
  trend: TrendAnalysis
  caption: CaptionAnalysis
  improvements: ImprovementPlan
  platform: string
  content_type: string
  processing_time_seconds: number
}

export type UploadResponse = {
  upload_id: string
  file_url: string
  content_type: string
  duration_seconds: number | null
  message: string
}

export type Platform = "tiktok" | "instagram" | "youtube_shorts" | "twitter" | "linkedin"

export type AnalyzeRequest = {
  upload_id: string
  caption?: string
  platform: Platform
  niche?: string
}

export type HealthStatus = {
  status: string
  env: string
  services: {
    supabase: string
    gemini: string
    tavily: string
  }
}

// ── API Functions ─────────────────────────────────────────────────────────────

export async function uploadContent(file: File): Promise<UploadResponse> {
  console.log("[API] uploadContent called, file:", file.name, file.size, file.type)
  const headers = await getAuthHeaders()
  console.log("[API] Auth headers obtained")
  const formData = new FormData()
  formData.append("file", file)

  // 30 second timeout for upload
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    console.log("[API] Sending POST to", `${API_URL}/upload`)
    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
      signal: controller.signal,
    })

    console.log("[API] Upload response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[API] Upload error:", errorData)
      throw new Error(errorData.detail || `Upload failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("[API] Upload success:", result)
    return result
  } catch (err) {
    console.error("[API] Upload exception:", err)
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Upload timed out — is the backend running on localhost:8000?")
    }
    if (err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("Failed"))) {
      throw new Error("Cannot connect to backend — make sure the Python server is running on localhost:8000")
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export async function analyzeContent(request: AnalyzeRequest): Promise<ViralityAnalysis> {
  const headers = await getAuthHeaders()

  // 120 second timeout for analysis (AI agents take time)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120000)

  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Analysis failed: ${response.status}`)
    }

    return response.json()
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Analysis timed out — the AI agents took too long. Try again with a smaller file.")
    }
    if (err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("Failed"))) {
      throw new Error("Cannot connect to backend — make sure the Python server is running on localhost:8000")
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export async function getAnalysis(analysisId: string): Promise<ViralityAnalysis> {
  const headers = await getAuthHeaders()

  const response = await fetch(`${API_URL}/analyze/${analysisId}`, {
    method: "GET",
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch analysis: ${response.status}`)
  }

  return response.json()
}

export async function listAnalyses(limit = 20): Promise<ViralityAnalysis[]> {
  const headers = await getAuthHeaders()

  const response = await fetch(`${API_URL}/analyze?limit=${limit}`, {
    method: "GET",
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to list analyses: ${response.status}`)
  }

  return response.json()
}

export async function checkHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_URL}/health`)
  if (!response.ok) {
    throw new Error("Backend health check failed")
  }
  return response.json()
}
