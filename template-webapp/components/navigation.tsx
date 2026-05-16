"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Menu, X, Sparkles, BarChart3, Zap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const { isPro } = useSubscription()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: "/analyze", label: "Analyze", icon: Sparkles },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  ]

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="md:hidden glass sticky top-0 z-50 w-full border-b border-white/[0.06]">
        <div className="container mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">Go Viral</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/[0.06] px-5 py-4 space-y-2 animate-slide-up" style={{ animationDuration: '0.3s' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm transition-all ${
                  pathname === link.href
                    ? "text-violet-300 bg-violet-500/10 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    {!isPro && (
                      <Link
                        href="/upgrade"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 border-0" size="sm">
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                          Upgrade to Pro
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/upgrade"
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 border-0" size="sm">Sign In</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:block glass sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="container mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">Go Viral</span>
            </Link>

            {/* Center Links */}
            <div className="flex items-center gap-1 glass rounded-2xl p-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm transition-all duration-300 ${
                    pathname === link.href
                      ? "text-violet-300 bg-violet-500/15 font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {!isLoading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <Link
                        href="/profile"
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                          pathname === "/profile" ? "text-violet-300 bg-violet-500/15" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                        title="Profile"
                      >
                        <User className="w-4.5 h-4.5" />
                      </Link>
                      {!isPro && (
                        <Link href="/upgrade">
                          <Button size="sm" className="text-xs rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 border-0 shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 transition-all">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Upgrade
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link href="/upgrade">
                        <Button variant="ghost" size="sm" className="text-sm rounded-xl hover:bg-white/5">
                          Pricing
                        </Button>
                      </Link>
                      <Button size="sm" className="text-sm rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 border-0 shadow-lg shadow-violet-600/20" asChild>
                        <Link href="/auth/login">Sign In</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
