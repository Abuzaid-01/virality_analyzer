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
      <nav className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Go Viral</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/50 px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 py-2 text-sm ${
                  pathname === link.href ? "text-primary font-medium" : "text-muted-foreground"
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
                      className="block py-2 text-sm text-muted-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {!isPro && (
                      <Link
                        href="/upgrade"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button className="w-full" size="sm">Upgrade to Pro</Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/upgrade"
                      className="block py-2 text-sm text-muted-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full" size="sm">Sign In</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:block border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Go Viral</span>
            </Link>

            {/* Center Links */}
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${
                    pathname === link.href
                      ? "text-primary bg-primary/10 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
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
                        className={`p-2 rounded-lg transition-colors ${
                          pathname === "/profile" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                        title="Profile"
                      >
                        <User className="w-5 h-5" />
                      </Link>
                      {!isPro && (
                        <Link href="/upgrade">
                          <Button size="sm" className="text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Upgrade
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link href="/upgrade">
                        <Button variant="ghost" size="sm" className="text-sm">
                          Pricing
                        </Button>
                      </Link>
                      <Button size="sm" className="text-sm" asChild>
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
