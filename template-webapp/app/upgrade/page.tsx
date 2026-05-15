"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Sparkles, Zap, Shield, Eye, TrendingUp, MessageSquare, Hash, BarChart3 } from "lucide-react"
import { useSubscription } from "@/contexts/subscription-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function UpgradePage() {
  const { isPro, tier, upgradeToPro, downgradeToFree, isLoading: subLoading } = useSubscription()
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/auth/signup?returnUrl=/upgrade")
      return
    }

    setIsProcessing(true)
    try {
      await upgradeToPro()
      toast.success("Welcome to Pro! Unlimited analyses unlocked.")
      router.push("/analyze")
    } catch (error) {
      toast.error("Failed to upgrade. Please try again.")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDowngrade = async () => {
    setIsProcessing(true)
    try {
      await downgradeToFree()
      toast.success("You've been downgraded to the Free plan.")
    } catch (error) {
      toast.error("Failed to downgrade. Please try again.")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Show current subscription if Pro
  if (isPro && !subLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center px-4 py-16 min-h-[calc(100vh-80px)]">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-12">
              <div className="mb-6 flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h1 className="text-5xl font-light tracking-tight mb-4">
                You&apos;re a <span className="font-semibold text-primary">Pro</span> member
              </h1>
              <p className="text-xl text-muted-foreground font-light">
                Unlimited analyses, priority processing, and full AI insights.
              </p>
            </div>

            <div className="border-2 border-primary rounded-2xl p-8 bg-card/50 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-primary font-medium mb-1">Current Plan</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Pro Plan
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <div className="font-medium text-green-400">Active</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Your Pro benefits:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Unlimited content analyses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Full AI hook, caption & trend analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Priority AI processing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Analysis history & dashboard
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/analyze">Analyze Content</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleDowngrade}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Downgrade to Free"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show pricing for free users
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center px-4 py-16 min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-light tracking-tight mb-4">
              Upgrade to <span className="font-semibold text-primary">Pro</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light">
              Unlimited AI analyses to maximize your content&apos;s viral potential.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Free Plan */}
            <div className="border border-border rounded-2xl p-8 bg-card/50">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Eye className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                  3 analyses per day
                </li>
                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                  <BarChart3 className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                  Basic virality score
                </li>
                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                  <MessageSquare className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                  Caption suggestions
                </li>
                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Hash className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                  Hashtag recommendations
                </li>
              </ul>

              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="relative border-2 border-primary rounded-2xl p-8 bg-card/50">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Recommended
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-primary mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Pro
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0" />
                  <span><strong>Unlimited</strong> analyses</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Eye className="w-5 h-5 text-primary flex-shrink-0" />
                  Full hook + pacing + thumbnail analysis
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                  Real-time trend intelligence
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
                  AI-optimized captions & hooks
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  Priority processing & full history
                </li>
              </ul>

              <Button
                className="w-full"
                size="lg"
                onClick={handleUpgrade}
                disabled={isProcessing || authLoading || subLoading}
              >
                {isProcessing ? "Processing..." : "Upgrade to Pro"}
              </Button>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-sm text-muted-foreground">
            <p>This is a demo. No real payment is processed.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
