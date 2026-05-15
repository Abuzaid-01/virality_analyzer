"use client"

import { ScoreRing, MiniScoreBar } from "@/components/score-ring"
import type { ViralityAnalysis } from "@/lib/api"
import {
  Eye, MessageSquare, TrendingUp, Lightbulb, Copy, Check,
  Clock, Zap, Hash, Music, AlertTriangle, Star, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type AnalysisResultsProps = {
  analysis: ViralityAnalysis
  onNewAnalysis: () => void
}

function SectionCard({ title, icon: Icon, children, accentColor }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  accentColor?: string
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor || "var(--primary)"}15` }}
        >
          <Icon className="w-4 h-4" style={{ color: accentColor || "var(--primary)" }} />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function CopyableText({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="rounded-xl bg-white/[0.03] border border-border/30 p-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}

export function AnalysisResults({ analysis, onNewAnalysis }: AnalysisResultsProps) {
  const { visual, trend, caption, improvements } = analysis

  return (
    <div className="space-y-8">
      {/* ── Hero Score Section ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <ScoreRing score={analysis.virality_score} size={180} strokeWidth={12} />
          <div className="flex-1 text-center lg:text-left space-y-3">
            <h2 className="text-2xl font-bold">Virality Score</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {analysis.one_line_verdict}
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-border/30">
                <Clock className="w-3 h-3" />
                {analysis.processing_time_seconds.toFixed(1)}s
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-border/30 capitalize">
                {analysis.platform}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-border/30 capitalize">
                {analysis.content_type}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Score Breakdown Grid ──────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Visual Analysis */}
        <SectionCard title="Visual Analysis" icon={Eye} accentColor="#8b5cf6">
          <div className="space-y-4">
            <MiniScoreBar score={visual.hook_score} label="Hook (First 3 Sec)" />
            <MiniScoreBar score={visual.thumbnail_score} label="Thumbnail Quality" />
            <MiniScoreBar score={visual.visual_quality_score} label="Visual Quality" />
            <MiniScoreBar score={visual.pacing_score} label="Pacing & Editing" />
          </div>
          {visual.hook_feedback && (
            <div className="mt-4 pt-4 border-t border-border/20">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Hook:</span> {visual.hook_feedback}
              </p>
            </div>
          )}
          {visual.thumbnail_feedback && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Thumbnail:</span> {visual.thumbnail_feedback}
              </p>
            </div>
          )}
        </SectionCard>

        {/* Caption Analysis */}
        <SectionCard title="Caption Analysis" icon={MessageSquare} accentColor="#06b6d4">
          <div className="space-y-4">
            <MiniScoreBar score={caption.caption_score} label="Caption Effectiveness" />
            <MiniScoreBar score={caption.hook_text_score} label="Hook Text Strength" />
          </div>
          <div className="mt-4 pt-4 border-t border-border/20 space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">CTA Present:</span>
              <span className={`font-medium ${caption.cta_present ? "text-green-400" : "text-orange-400"}`}>
                {caption.cta_present ? "Yes" : "No"}
                {caption.cta_strength && ` (${caption.cta_strength})`}
              </span>
            </div>
            {caption.emotion_triggers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {caption.emotion_triggers.map((trigger, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Trend Analysis */}
        <SectionCard title="Trend Alignment" icon={TrendingUp} accentColor="#22c55e">
          <MiniScoreBar score={trend.trend_alignment_score} label="Trend Score" />
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            {trend.trend_summary}
          </p>
          {trend.best_posting_times.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/20">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="w-3 h-3 text-green-400" />
                <span className="text-xs font-medium">Best Posting Times</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {trend.best_posting_times.map((time, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          )}
          {trend.platform_specific_tips.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/20">
              <span className="text-xs font-medium mb-2 block">Platform Tips</span>
              <ul className="space-y-1.5">
                {trend.platform_specific_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        {/* Improvement Plan */}
        <SectionCard title="Improvement Plan" icon={Lightbulb} accentColor="#f59e0b">
          <div className="space-y-4">
            {/* Priority Fixes */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">Priority Fixes</span>
              </div>
              <ul className="space-y-2">
                {improvements.priority_fixes.map((fix, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/5 rounded-lg p-2.5 border border-amber-500/10">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {fix}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Wins */}
            {improvements.quick_wins.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Quick Wins</span>
                </div>
                <ul className="space-y-1.5">
                  {improvements.quick_wins.map((win, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-400" />
                      {win}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What Works */}
            {improvements.what_works.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-medium text-cyan-400">What Works</span>
                </div>
                <ul className="space-y-1.5">
                  {improvements.what_works.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 mt-0.5 flex-shrink-0 text-cyan-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Predicted Score */}
            <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Score after fixes</span>
              <span className="text-lg font-bold text-green-400">
                {improvements.predicted_score_after_fixes}
                <span className="text-xs font-normal text-muted-foreground ml-1">/100</span>
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Optimized Caption ──────────────────────────────────────────────── */}
      <SectionCard title="AI-Optimized Content" icon={MessageSquare} accentColor="#a855f7">
        <div className="space-y-6">
          <CopyableText
            label="Optimized Hook"
            text={caption.optimized_hook}
          />
          <CopyableText
            label="Optimized Caption"
            text={caption.optimized_caption}
          />
        </div>
      </SectionCard>

      {/* ── Hashtags & Audio ───────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Hashtags */}
        <SectionCard title="Recommended Hashtags" icon={Hash} accentColor="#3b82f6">
          <div className="flex flex-wrap gap-2">
            {(caption.hashtag_suggestions?.length > 0
              ? caption.hashtag_suggestions
              : trend.trending_hashtags
            ).map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/15 cursor-pointer hover:bg-blue-500/20 transition-colors"
                onClick={() => navigator.clipboard.writeText(tag.startsWith("#") ? tag : `#${tag}`)}
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </SectionCard>

        {/* Trending Audio */}
        {trend.trending_audio_suggestions.length > 0 && (
          <SectionCard title="Trending Audio" icon={Music} accentColor="#ec4899">
            <ul className="space-y-2.5">
              {trend.trending_audio_suggestions.map((audio, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-muted-foreground p-2.5 rounded-lg bg-pink-500/5 border border-pink-500/10"
                >
                  <Music className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                  {audio}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>

      {/* ── Action Bar ─────────────────────────────────────────────────────── */}
      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onNewAnalysis} className="px-8">
          Analyze Another
        </Button>
      </div>
    </div>
  )
}
