import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Sparkles, Zap, Eye, TrendingUp, MessageSquare, BarChart3,
  Hash, ArrowRight, Check, Music
} from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Eye,
      title: "Hook Analysis",
      description: "AI evaluates your first 3 seconds — the make-or-break moment that determines if viewers keep watching or scroll away.",
      color: "#8b5cf6",
    },
    {
      icon: BarChart3,
      title: "Virality Score (0-100)",
      description: "Get a weighted score based on hook strength (30%), trend alignment (20%), caption (15%), thumbnail (15%), and more.",
      color: "#22c55e",
    },
    {
      icon: MessageSquare,
      title: "Caption Optimization",
      description: "AI rewrites your caption for maximum engagement — optimized hooks, CTAs, emotional triggers, and hashtag strategy.",
      color: "#06b6d4",
    },
    {
      icon: TrendingUp,
      title: "Trend Intelligence",
      description: "Real-time analysis of trending content, hashtags, and audio suggestions aligned with your niche and platform.",
      color: "#f59e0b",
    },
    {
      icon: Zap,
      title: "Actionable Feedback",
      description: "Not vague advice — specific priority fixes like 'Replace thumbnail with shocked reaction face' to boost your score.",
      color: "#ef4444",
    },
    {
      icon: Music,
      title: "Audio & Hashtag Recs",
      description: "Trending audio suggestions and 30+ optimized hashtags tailored to your content niche and target platform.",
      color: "#ec4899",
    },
  ]

  const stats = [
    { value: "5", label: "AI Agents" },
    { value: "<30s", label: "Analysis Time" },
    { value: "0-100", label: "Score Range" },
    { value: "5", label: "Platforms" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              <Sparkles className="w-4 h-4" />
              AI Content Virality Analyzer
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
              Will your content{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-pink-400">
                go viral?
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Upload your video or image. Five AI agents analyze hook strength, pacing,
              caption quality, and trend alignment — then score your viral potential from 0 to 100
              with specific fixes to maximize reach.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="px-8 py-6 text-lg group" asChild>
                <Link href="/analyze">
                  Analyze Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg" asChild>
                <Link href="/upgrade">View Pricing</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-border/20 mt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five specialized AI agents work in parallel to dissect your content
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Upload",
                description: "Drop your video or image — MP4, MOV, WebM, JPG, or PNG up to 100MB.",
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "5 agents analyze: Vision → Trends → Caption → Feedback → Final Score in under 30 seconds.",
              },
              {
                step: "03",
                title: "Get Results",
                description: "Receive your virality score, detailed breakdown, optimized caption, and priority fixes.",
              },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-card/30 border border-border/30">
                <span className="text-5xl font-bold text-primary/10 absolute top-4 right-6">{item.step}</span>
                <div className="relative z-10 pt-8">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-24 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Powerful AI Features</h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
            Every aspect of your content is analyzed by specialized AI agents
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-card/30 border border-border/30 hover:border-border/60 transition-all duration-300 group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scoring Breakdown ──────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Scoring Breakdown</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Your virality score is calculated using a weighted formula
          </p>
          <div className="space-y-4">
            {[
              { label: "Hook (Visual + Text)", weight: 30, color: "#ef4444" },
              { label: "Trend Alignment", weight: 20, color: "#f59e0b" },
              { label: "Caption Quality", weight: 15, color: "#06b6d4" },
              { label: "Thumbnail Click-Through", weight: 15, color: "#8b5cf6" },
              { label: "Visual Quality", weight: 10, color: "#22c55e" },
              { label: "Pacing & Editing", weight: 10, color: "#ec4899" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-48 text-right">{item.label}</span>
                <div className="flex-1 h-7 rounded-lg bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center justify-end pr-3"
                    style={{
                      width: `${item.weight * 3.3}%`,
                      backgroundColor: `${item.color}30`,
                      borderLeft: `3px solid ${item.color}`,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: item.color }}>{item.weight}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to go viral?</h2>
          <p className="text-lg text-muted-foreground">
            Upload your content now and get AI-powered insights to maximize your reach.
          </p>
          <Button size="lg" className="px-8 py-6 text-lg" asChild>
            <Link href="/analyze">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Free Analysis
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
