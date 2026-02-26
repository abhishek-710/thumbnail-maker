"use client"

import { useState } from "react"
import { Coins, Star, Check, ArrowRight, Receipt, CreditCard, Sparkles, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { PRICING_PLANS, CREDITS_PER_IMAGE } from "@/lib/constants"
import type { Transaction } from "@/lib/types"

function CreditBalance({ credits }: { credits: number }) {
  const thumbnailsLeft = Math.floor(credits / CREDITS_PER_IMAGE)
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="animate-pulse-glow flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Coins className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available Credits</p>
            <p className="text-4xl font-bold text-foreground">{credits}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{thumbnailsLeft}</p>
            <p className="text-xs text-muted-foreground">thumbnails left</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{CREDITS_PER_IMAGE}</p>
            <p className="text-xs text-muted-foreground">credits/image</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PricingCard({
  plan,
  onPurchase,
  purchasing,
}: {
  plan: typeof PRICING_PLANS[number]
  onPurchase: () => void
  purchasing: boolean
}) {
  return (
    <div
      className={`relative flex flex-col rounded-xl border p-6 transition-all ${
        plan.popular
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            <Star className="h-3 w-3" />
            Most Popular
          </div>
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
        <p className="text-sm text-muted-foreground">{plan.credits} credits</p>
      </div>
      <div className="mb-1">
        <span className="text-4xl font-bold text-foreground">${plan.price}</span>
      </div>
      <p className="mb-6 text-xs text-muted-foreground">${plan.perCredit} per credit</p>
      <ul className="mb-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onPurchase}
        disabled={purchasing}
        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
          plan.popular
            ? "bg-primary text-primary-foreground hover:bg-[#7c3aed]"
            : "border border-border text-foreground hover:bg-surface-hover hover:border-primary/30"
        } disabled:opacity-50`}
      >
        <CreditCard className="h-4 w-4" />
        {purchasing ? "Processing..." : "Purchase"}
      </button>
    </div>
  )
}

function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Receipt className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No transactions yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-hover">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Credits</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-foreground">{tx.planName}</td>
                <td className="px-4 py-3 text-right font-medium text-primary">+{tx.creditsAdded}</td>
                <td className="px-4 py-3 text-right text-foreground">
                  ${(tx.amountPaid / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    tx.status === "completed"
                      ? "bg-[#22c55e]/10 text-[#22c55e]"
                      : tx.status === "pending"
                        ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                        : "bg-destructive/10 text-destructive"
                  }`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function CreditsPage() {
  const { user, updateCredits } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [purchasing, setPurchasing] = useState<string | null>(null)

  async function handlePurchase(planId: string) {
    const plan = PRICING_PLANS.find((p) => p.id === planId)
    if (!plan) return

    setPurchasing(planId)

    // Simulate Stripe checkout (in production, this would redirect to Stripe)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Add credits
      const newCredits = (user?.credits ?? 0) + plan.credits
      updateCredits(newCredits)

      // Record transaction
      const transaction: Transaction = {
        id: Math.random().toString(36).substring(2),
        userId: user?.id ?? "",
        planId: plan.id,
        planName: plan.name,
        creditsAdded: plan.credits,
        amountPaid: plan.priceInCents,
        currency: "usd",
        status: "completed",
        createdAt: new Date().toISOString(),
      }
      setTransactions((prev) => [transaction, ...prev])

      toast.success(`${plan.credits} credits added to your account!`)
    } catch {
      toast.error("Purchase failed. Please try again.")
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Balance */}
      <CreditBalance credits={user?.credits ?? 0} />

      {/* How credits work */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          How Credits Work
        </h3>
        <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</div>
            <p>Each thumbnail generation costs <strong className="text-foreground">5 credits</strong> per image variation</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</div>
            <p>Generate up to <strong className="text-foreground">4 variations</strong> at once (20 credits max)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</div>
            <p>Credits <strong className="text-foreground">never expire</strong> -- use them whenever you need</p>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Buy Credits
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onPurchase={() => handlePurchase(plan.id)}
              purchasing={purchasing === plan.id}
            />
          ))}
        </div>
        <p className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <CreditCard className="h-3 w-3" />
          Secure payments powered by Stripe. Connect Stripe integration to enable real payments.
        </p>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
          <Receipt className="h-5 w-5 text-primary" />
          Transaction History
        </h2>
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  )
}
