import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Sparkles, Zap, Eye, TrendingUp, MessageSquare, BarChart3,
  Hash, ArrowRight, Check, Music, Brain, Layers, Shield
} from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Eye,
      title: "Visual Hook Detection",
      description: "AI watches your first 3 seconds and tells you exactly whether viewers will stop scrolling — or keep going.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: BarChart3,
      title: "Virality Score 0–100",
      description: "Weighted scoring: hook strength, trend alignment, caption quality, thumbnail appeal, visual quality, and pacing.",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: MessageSquare,
      title: "AI Caption Rewrite",
      description: "Llama 3.3 rewrites your caption with scroll-stopping hooks, emotional triggers, CTAs, and strategic hashtags.",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Live Trend Intel",
      description: "Scours the internet in real-time to match your content with what's trending right now in your niche.",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: Zap,
      title: "Priority Fix List",
      description: "Not vague tips — specific fixes like 'Replace thumbnail with shocked reaction face' ranked by impact.",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      icon: Music,
      title: "Audio & Hashtag Recs",
      description: "Trending audio suggestions and 30+ optimized hashtags tailored to your exact content niche and platform.",
      gradient: "from-fuchsia-500 to-purple-600",
    },
  ]

  const techStack = [
    { icon: Brain, label: "Gemini 2.0 Flash", desc: "Vision Analysis" },
    { icon: Layers, label: "Llama 3.3 70B", desc: "Content Generation" },
    { icon: Shield, label: "LangGraph", desc: "Agent Orchestration" },
  ]

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navigation />

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Ambient background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Central glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-violet-600/8 blur-[150px] animate-glow" />
          {/* Side accents */}
          <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
          {/* Orbiting ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-violet-500/5 animate-orbit" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-violet-500/3 animate-orbit" style={{ animationDirection: "reverse", animationDuration: "30s" }} />
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(rgba(139, 92, 246, 0.06) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="animate-slide-up opacity-0 mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-violet-500/20 text-sm font-medium text-violet-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                </span>
                Multi-Agent AI Pipeline
              </div>
            </div>

            {/* Headline */}
            <h1 className="animate-slide-up opacity-0 delay-100 text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8">
              Will your content
              <br />
              <span className="gradient-text">go viral?</span>
            </h1>

            {/* Subheadline */}
            <p className="animate-slide-up opacity-0 delay-200 text-lg sm:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-10">
              Upload your video or image. Five AI agents analyze hook strength, pacing,
              caption quality, and trend alignment — then score your viral potential
              with specific fixes to maximize reach.
            </p>

            {/* CTA */}
            <div className="animate-slide-up opacity-0 delay-300 flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="px-10 py-7 text-lg rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 transition-all duration-300 group border-0" asChild>
                <Link href="/analyze">
                  Analyze Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-10 py-7 text-lg rounded-2xl glass border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300" asChild>
                <Link href="/upgrade">View Pricing</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="animate-slide-up opacity-0 delay-400 flex flex-wrap justify-center gap-4 sm:gap-6">
              {[
                { value: "5", label: "AI Agents", icon: Brain },
                { value: "<30s", label: "Analysis", icon: Zap },
                { value: "0–100", label: "Score Range", icon: BarChart3 },
                { value: "5", label: "Platforms", icon: Hash },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-2xl px-5 py-3 flex items-center gap-3 hover:border-violet-500/20 transition-colors">
                  <stat.icon className="w-4 h-4 text-violet-400" />
                  <div className="text-left">
                    <div className="text-base font-bold text-foreground">{stat.value}</div>
                    <div className="text-[11px] text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────── */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-sm font-medium text-violet-400 tracking-widest uppercase mb-4 block">How It Works</span>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
                Three steps to
                <span className="gradient-text"> viral content</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Five specialized AI agents work in sequence to dissect and score your content
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "Upload",
                  description: "Drop your video or image — MP4, MOV, WebM, JPG, or PNG up to 100MB. Add your caption and pick a platform.",
                  gradient: "from-violet-500/20 to-purple-500/20",
                },
                {
                  step: "02",
                  title: "AI Analysis",
                  description: "5 agents chain: Vision → Trends → Caption → Feedback → Score. Gemini sees the content, Llama writes the copy.",
                  gradient: "from-cyan-500/20 to-blue-500/20",
                },
                {
                  step: "03",
                  title: "Get Results",
                  description: "Virality score, detailed breakdown, optimized caption, priority fixes, hashtags, and trending audio suggestions.",
                  gradient: "from-emerald-500/20 to-teal-500/20",
                },
              ].map((item, idx) => (
                <div key={item.step} className="group relative">
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                  <div className="relative glass rounded-3xl p-8 h-full hover:border-white/10 transition-all duration-500">
                    <span className="text-7xl font-black text-white/[0.03] absolute top-4 right-6 select-none">{item.step}</span>
                    <div className="relative z-10 pt-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-5">
                        <span className="text-lg font-bold text-violet-400">{idx + 1}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────────────── */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-sm font-medium text-violet-400 tracking-widest uppercase mb-4 block">Features</span>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
                Everything you need to
                <span className="gradient-text"> dominate</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Each aspect of your content is analyzed by specialized AI agents trained for virality
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, idx) => (
                <div
                  key={feature.title}
                  className="group glass rounded-2xl p-7 hover:border-white/10 transition-all duration-500 relative overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-base mb-2 group-hover:text-white transition-colors">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Scoring Breakdown ──────────────────────────────────────────── */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-violet-400 tracking-widest uppercase mb-4 block">Scoring</span>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
                How your
                <span className="gradient-text"> score works</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Your virality score is calculated using a weighted formula across all dimensions
              </p>
            </div>

            <div className="glass rounded-3xl p-8 space-y-5">
              {[
                { label: "Hook (Visual + Text)", weight: 30, color: "#a855f7", gradient: "from-violet-500 to-purple-500" },
                { label: "Trend Alignment", weight: 20, color: "#22c55e", gradient: "from-emerald-500 to-green-500" },
                { label: "Caption Quality", weight: 15, color: "#06b6d4", gradient: "from-cyan-500 to-blue-500" },
                { label: "Thumbnail Appeal", weight: 15, color: "#f59e0b", gradient: "from-amber-500 to-orange-500" },
                { label: "Visual Quality", weight: 10, color: "#ec4899", gradient: "from-pink-500 to-rose-500" },
                { label: "Pacing & Editing", weight: 10, color: "#6366f1", gradient: "from-indigo-500 to-violet-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-44 text-right font-medium hidden sm:block">{item.label}</span>
                  <span className="text-sm text-muted-foreground sm:hidden font-medium min-w-0 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 h-8 rounded-xl bg-white/[0.03] overflow-hidden">
                    <div
                      className={`h-full rounded-xl flex items-center justify-end pr-3 bg-gradient-to-r ${item.gradient}`}
                      style={{ width: `${item.weight * 3.3}%`, opacity: 0.25 }}
                    >
                      <span className="text-xs font-bold text-white">{item.weight}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack Section ─────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-sm font-medium text-violet-400 tracking-widest uppercase mb-4 block">Technology</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Multi-Model AI Architecture</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {techStack.map((tech) => (
                <div key={tech.label} className="glass rounded-2xl p-5 text-center hover:border-violet-500/20 transition-all duration-300">
                  <tech.icon className="w-7 h-7 text-violet-400 mx-auto mb-3" />
                  <p className="text-sm font-bold mb-1">{tech.label}</p>
                  <p className="text-[11px] text-muted-foreground">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────────────── */}
      <section className="relative py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Ready to go{" "}
              <span className="gradient-text">viral?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Upload your content now and get AI-powered insights to maximize your reach.
            </p>
            <Button size="lg" className="px-12 py-7 text-lg rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-600/25 hover:shadow-violet-500/35 transition-all duration-300 border-0" asChild>
              <Link href="/analyze">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free Analysis
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
