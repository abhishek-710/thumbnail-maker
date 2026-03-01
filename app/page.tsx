"use client"

import { useState } from "react"
import Link from "next/link"
import { Sparkles, Image, Palette, Zap, ArrowRight, Check, Menu, X, Clock, CreditCard, Star, Layers } from "lucide-react"
import { PRICING_PLANS } from "@/lib/constants"

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">ThumbBoost</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How It Works</a>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Log In
          </Link>
          <Link href="/signup" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#7c3aed]">
            Get Started Free
          </Link>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground" aria-label="Toggle menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#features" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground">Features</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground">How It Works</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground">Pricing</a>
            <hr className="border-border" />
            <Link href="/login" className="text-sm text-muted-foreground">Log In</Link>
            <Link href="/signup" className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[128px]" />
        <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <Sparkles className="h-4 w-4" />
          <span>Powered by AI -- 50 free credits on signup</span>
        </div>
        <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
          Create Stunning{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Thumbnails
          </span>{" "}
          with AI
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          Generate professional thumbnails for YouTube, Instagram, TikTok and more in seconds.
          Choose your style, customize options, and let AI do the rest.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-primary/25"
          >
            Start Creating Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-surface-hover"
          >
            See How It Works
          </a>
        </div>
        {/* Stats */}
        <div className="mt-16 flex items-center justify-center gap-8 md:gap-16">
          {[
            { label: "Thumbnails Created", value: "50K+" },
            { label: "Active Users", value: "2K+" },
            { label: "Platforms Supported", value: "8+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-foreground md:text-3xl">{stat.value}</div>
              <div className="text-xs text-muted-foreground md:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: Image,
      title: "AI-Powered Generation",
      description: "Describe your vision and our AI creates stunning thumbnails instantly using advanced image generation.",
    },
    {
      icon: Palette,
      title: "8 Unique Art Styles",
      description: "Choose from Realistic, Cartoon, 3D Render, Anime, Flat Design, Watercolor, Cinematic, and Neon Glow.",
    },
    {
      icon: Layers,
      title: "Multiple Size Options",
      description: "Generate in Square (1024x1024), Landscape (1792x1024), or Portrait (1024x1792) formats.",
    },
    {
      icon: Zap,
      title: "Color Schemes & Text",
      description: "Apply vibrant, dark, pastel, or neon color schemes. Add custom text overlays to your thumbnails.",
    },
    {
      icon: Clock,
      title: "Generation History",
      description: "All your past creations are saved. Browse, download, or regenerate from your history anytime.",
    },
    {
      icon: CreditCard,
      title: "Flexible Credits",
      description: "Start with 50 free credits. Each generation costs 5 credits. Buy more when you need them.",
    },
  ]

  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Everything You Need</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Professional thumbnail creation made simple with AI-powered tools and full customization.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-surface-hover"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Choose Your Style",
      description: "Select from 8 art styles, pick your platform preset, color scheme, and customization options.",
    },
    {
      step: "02",
      title: "Describe Your Vision",
      description: "Write a prompt describing what you want. Add text overlays and choose how many variations to generate.",
    },
    {
      step: "03",
      title: "Download & Use",
      description: "Get your AI-generated thumbnails in seconds. Download in full HD and use across all your platforms.",
    },
  ]

  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Three simple steps to create professional thumbnails.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.step} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-10 hidden h-px w-full bg-gradient-to-r from-primary/50 to-transparent md:block" style={{ left: '60%', width: '80%' }} />
              )}
              <div className="relative z-10 mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
                <span className="text-2xl font-bold text-primary">{step.step}</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Simple, Flexible Pricing</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Start free with 50 credits. Buy more whenever you need them.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 transition-all ${
                plan.popular
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.credits} credits</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-sm text-muted-foreground"> / ${plan.perCredit} per credit</span>
              </div>
              <ul className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-[#7c3aed]"
                    : "border border-border text-foreground hover:bg-surface-hover"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">ThumbBoost</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Built with AI. Create thumbnails that stand out.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms</a>
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  )
}
