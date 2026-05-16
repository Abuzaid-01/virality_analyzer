"use client"

import { useEffect, useState } from "react"
import { Eye, TrendingUp, MessageSquare, Lightbulb, Calculator } from "lucide-react"

const PIPELINE_STEPS = [
  { id: "vision", label: "Analyzing visuals & hook", icon: Eye, duration: 4000, color: "#a855f7" },
  { id: "trend", label: "Scanning live trends", icon: TrendingUp, duration: 3000, color: "#22c55e" },
  { id: "caption", label: "Optimizing caption", icon: MessageSquare, duration: 3000, color: "#06b6d4" },
  { id: "feedback", label: "Generating improvements", icon: Lightbulb, duration: 2000, color: "#f59e0b" },
  { id: "score", label: "Calculating virality score", icon: Calculator, duration: 1000, color: "#ec4899" },
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
    <div className="flex flex-col items-center justify-center py-20 space-y-12">
      {/* Animated ring */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full glass flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center animate-pulse">
              {(() => {
                const StepIcon = PIPELINE_STEPS[activeStep].icon
                return <StepIcon className="w-7 h-7 text-violet-400" />
              })()}
            </div>
          </div>
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-[-12px] animate-orbit" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />
        </div>
        <div className="absolute inset-[-20px] animate-orbit" style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
        </div>
        <div className="absolute inset-[-8px] rounded-full border border-violet-500/20 animate-ping" style={{ animationDuration: "2.5s" }} />
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Analyzing your content</h3>
        <p className="text-sm text-muted-foreground">
          AI agents are evaluating your content for viral potential
        </p>
      </div>

      {/* Pipeline steps */}
      <div className="w-full max-w-sm space-y-2">
        {PIPELINE_STEPS.map((step, idx) => {
          const isActive = idx === activeStep
          const isDone = idx < activeStep
          const isPending = idx > activeStep

          return (
            <div
              key={step.id}
              className={`
                flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-500
                ${isActive ? "glass glow-border scale-[1.02]" : ""}
                ${isDone ? "opacity-50" : ""}
                ${isPending ? "opacity-25" : ""}
              `}
            >
              <div className={`
                w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500
                ${isActive ? "bg-gradient-to-br from-violet-500/30 to-purple-500/30 shadow-lg" : isDone ? "bg-emerald-500/15" : "bg-white/5"}
              `}>
                {isDone ? (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <step.icon className="w-4 h-4 text-violet-400 animate-pulse" />
                ) : (
                  <step.icon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <span className={`text-sm ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
              {isActive && (
                <div className="ml-auto flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Timer */}
      <p className="text-xs text-muted-foreground tabular-nums glass px-5 py-2 rounded-full">
        {(elapsed / 1000).toFixed(1)}s elapsed · typically 10–30 seconds
      </p>
    </div>
  )
}
