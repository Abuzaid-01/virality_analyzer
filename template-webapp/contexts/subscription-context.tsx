"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"

export type Tier = "free" | "pro"

export type Subscription = {
  id: string
  user_id: string
  tier: Tier
  created_at: string
  updated_at: string
}

type SubscriptionContextType = {
  subscription: Subscription | null
  isLoading: boolean
  isPro: boolean
  tier: Tier
  upgradeToPro: () => Promise<void>
  downgradeToFree: () => Promise<void>
  refresh: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isLoading: true,
  isPro: false,
  tier: "free",
  upgradeToPro: async () => {},
  downgradeToFree: async () => {},
  refresh: async () => {},
})

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscription = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setSubscription(null)
        setIsLoading(false)
        return
      }

      // Try to get existing subscription
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error) {
        // PGRST116 = no rows, PGRST205 = table doesn't exist — both are OK
        if (error.code !== "PGRST116" && error.code !== "PGRST205") {
          console.warn("[SubscriptionContext] Fetch:", error.code)
        }

        // If table exists but no row, try to create one
        if (error.code === "PGRST116") {
          const { data: newSub, error: insertError } = await supabase
            .from("subscriptions")
            .insert({ user_id: user.id, tier: "free" })
            .select()
            .single()

          if (!insertError && newSub) {
            setSubscription(newSub as Subscription)
          }
          // If insert also fails (table missing, RLS, etc.), just use defaults
        }

        // For any error case, fall back to a virtual free subscription
        if (!data) {
          setSubscription({
            id: "local-default",
            user_id: user.id,
            tier: "free",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      } else if (data) {
        setSubscription(data as Subscription)
      }

      setIsLoading(false)
    } catch (error) {
      // Network or unexpected errors — just default to free
      setSubscription(null)
      setIsLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchSubscription()
  }, [fetchSubscription])

  const upgradeToPro = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("subscriptions")
      .update({ tier: "pro" })
      .eq("user_id", user.id)

    if (error) {
      console.error("[SubscriptionContext] Upgrade error:", error)
      throw error
    }

    await refresh()
  }, [refresh])

  const downgradeToFree = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("subscriptions")
      .update({ tier: "free" })
      .eq("user_id", user.id)

    if (error) {
      console.error("[SubscriptionContext] Downgrade error:", error)
      throw error
    }

    await refresh()
  }, [refresh])

  useEffect(() => {
    fetchSubscription()

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchSubscription()
        } else {
          setSubscription(null)
          setIsLoading(false)
        }
      }
    )

    return () => {
      authSubscription.unsubscribe()
    }
  }, [fetchSubscription])

  // Compute derived values
  const isPro = subscription?.tier === "pro"
  const tier = subscription?.tier ?? "free"

  return (
    <SubscriptionContext.Provider value={{ subscription, isLoading, isPro, tier, upgradeToPro, downgradeToFree, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
