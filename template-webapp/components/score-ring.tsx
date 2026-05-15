"use client"

import { useEffect, useState } from "react"

type ScoreRingProps = {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
  showLevel?: boolean
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e"  // green
  if (score >= 60) return "#eab308"  // yellow
  if (score >= 40) return "#f97316"  // orange
  return "#ef4444"                    // red
}

function getScoreLevel(score: number): string {
  if (score >= 80) return "Viral"
  if (score >= 60) return "Good"
  if (score >= 40) return "Average"
  return "Poor"
}

export function ScoreRing({ score, size = 160, strokeWidth = 10, label, showLevel = true }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedScore / 100) * circumference
  const color = getScoreColor(score)

  useEffect(() => {
    const duration = 1200
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setAnimatedScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.1s ease-out",
              filter: `drop-shadow(0 0 8px ${color}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold tabular-nums"
            style={{ fontSize: size * 0.28, color }}
          >
            {animatedScore}
          </span>
          {showLevel && (
            <span
              className="text-xs font-medium uppercase tracking-wider opacity-70"
              style={{ color }}
            >
              {getScoreLevel(score)}
            </span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      )}
    </div>
  )
}

// Mini version for score breakdowns
export function MiniScoreBar({ score, label }: { score: number; label: string }) {
  const [width, setWidth] = useState(0)
  const color = getScoreColor(score)

  useEffect(() => {
    setTimeout(() => setWidth(score), 100)
  }, [score])

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {score}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  )
}
