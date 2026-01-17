import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Search, Users, MessageCircle, ArrowRight, Zap } from "lucide-react"
import { ActivateButton, CheckStatusButton } from "@/components/telegram-buttons"

function ActivateButtonComponent() {
  return (
    <form action="/api/telegram/activate" method="GET">
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="border-green-500 text-green-500 hover:bg-green-500/10 bg-transparent"
      >
        <Zap className="mr-2 h-4 w-4" />
        Activate Bot
      </Button>
    </form>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">Campus Lost & Found</span>
          </div>
          <div className="flex items-center gap-4">
            <ActivateButton />
            <CheckStatusButton />
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin Dashboard
              </Button>
            </Link>
            <a href="https://t.me/ReFoundNUSv1_bot" target="_blank" rel="noopener noreferrer">
              <Button size="sm">
                <MessageCircle className="mr-2 h-4 w-4" />
                Open Bot
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Lost Something on Campus?
            <br />
            <span className="text-primary">We&apos;ll Help You Find It</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Connect with your campus community through our Telegram bot. Report lost items, help others find their
            belongings, and get notified when there&apos;s a match.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a href="https://t.me/ReFoundNUSv1_bot" target="_blank" rel="noopener noreferrer">
              <Button size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Using the Bot
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-foreground">How It Works</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            Simple and intuitive process to report and find lost items
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Report Items</CardTitle>
                <CardDescription>
                  Lost something? Found something? Report it through our Telegram bot with photos and location details.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Smart Matching</CardTitle>
                <CardDescription>
                  Our system automatically matches lost items with found items based on category, location, and
                  description.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Connect & Claim</CardTitle>
                <CardDescription>
                  Get notified when there&apos;s a potential match. Submit claims and connect with the finder to
                  retrieve your item.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">Ready to Get Started?</h2>
          <p className="mt-2 text-muted-foreground">Open our Telegram bot and start reporting or searching for items</p>
          <div className="mt-8">
            <a href="https://t.me/ReFoundNUSv1_bot" target="_blank" rel="noopener noreferrer">
              <Button size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Open Telegram Bot
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>Campus Lost & Found Bot - Helping students reunite with their belongings</p>
        </div>
      </footer>
    </div>
  )
}
