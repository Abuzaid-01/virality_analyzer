"use client"

import { useEffect, useState } from "react"
import { Loader2, Eye, TrendingUp, MessageSquare, Lightbulb, Calculator } from "lucide-react"

const PIPELINE_STEPS = [
  { id: "vision", label: "Analyzing visuals & hook", icon: Eye, duration: 4000 },
  { id: "trend", label: "Checking trending content", icon: TrendingUp, duration: 3000 },
  { id: "caption", label: "Optimizing caption", icon: MessageSquare, duration: 3000 },
  { id: "feedback", label: "Generating improvements", icon: Lightbulb, duration: 2000 },
  { id: "score", label: "Calculating virality score", icon: Calculator, duration: 1000 },
]

export function AnalyzingState() {
  const [activeStep, setActiveStep] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((e) => e + 100)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let totalDelay = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []
    PIPELINE_STEPS.forEach((step, idx) => {
      if (idx === 0) return
      totalDelay += step.duration
      timeouts.push(setTimeout(() => setActiveStep(idx), totalDelay))
    })
    return () => timeouts.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-10">
      {/* Pulsing ring */}
      <div className="relative">
        <div className="w-28 h-28 rounded-full border-4 border-primary/20 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-primary/40 animate-ping" style={{ animationDuration: "2s" }} />
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Analyzing your content</h3>
        <p className="text-sm text-muted-foreground">
          AI agents are evaluating your content for viral potential
        </p>
      </div>

      {/* Pipeline steps */}
      <div className="w-full max-w-sm space-y-3">
        {PIPELINE_STEPS.map((step, idx) => {
          const isActive = idx === activeStep
          const isDone = idx < activeStep
          const isPending = idx > activeStep

          return (
            <div
              key={step.id}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500
                ${isActive ? "bg-primary/10 border border-primary/30" : ""}
                ${isDone ? "opacity-50" : ""}
                ${isPending ? "opacity-30" : ""}
              `}
            >
              <div className={`
                w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                ${isActive ? "bg-primary/20" : isDone ? "bg-green-500/20" : "bg-white/5"}
              `}>
                {isDone ? (
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                ) : (
                  <step.icon className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
              <span className={`text-sm ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Timer */}
      <p className="text-xs text-muted-foreground tabular-nums">
        {(elapsed / 1000).toFixed(1)}s elapsed · typically takes 10-30 seconds
      </p>
    </div>
  )
}
