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
  if (score >= 60) return "#a855f7"  // violet
  if (score >= 40) return "#f59e0b"  // amber
  return "#ef4444"                    // red
}

function getScoreGradient(score: number): [string, string] {
  if (score >= 80) return ["#22c55e", "#10b981"]
  if (score >= 60) return ["#a855f7", "#7c3aed"]
  if (score >= 40) return ["#f59e0b", "#d97706"]
  return ["#ef4444", "#dc2626"]
}

function getScoreLevel(score: number): string {
  if (score >= 80) return "Viral Ready"
  if (score >= 60) return "Strong"
  if (score >= 40) return "Needs Work"
  return "Weak"
}

export function ScoreRing({ score, size = 160, strokeWidth = 10, label, showLevel = true }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedScore / 100) * circumference
  const color = getScoreColor(score)
  const [gradStart, gradEnd] = getScoreGradient(score)

  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4) // ease-out quartic
      setAnimatedScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  const gradientId = `score-gradient-${size}`

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow behind ring */}
        <div
          className="absolute inset-4 rounded-full blur-2xl opacity-20"
          style={{ backgroundColor: color }}
        />
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradStart} />
              <stop offset="100%" stopColor={gradEnd} />
            </linearGradient>
          </defs>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.1s ease-out",
              filter: `drop-shadow(0 0 12px ${color}50)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-black tabular-nums"
            style={{ fontSize: size * 0.3, color }}
          >
            {animatedScore}
          </span>
          {showLevel && (
            <span
              className="text-[11px] font-semibold uppercase tracking-widest mt-0.5"
              style={{ color, opacity: 0.8 }}
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
  const [gradStart, gradEnd] = getScoreGradient(score)

  useEffect(() => {
    setTimeout(() => setWidth(score), 100)
  }, [score])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${gradStart}, ${gradEnd})`,
            boxShadow: `0 0 12px ${color}30`,
          }}
        />
      </div>
    </div>
  )
}
