"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Circle, ExternalLink, Copy, Check } from "lucide-react"

export default function SetupPage() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [webhookStatus, setWebhookStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [webhookMessage, setWebhookMessage] = useState("")
  const [copied, setCopied] = useState(false)

  const deployedUrl = typeof window !== "undefined" ? window.location.origin : ""

  const setWebhook = async () => {
    const url = webhookUrl || deployedUrl
    if (!url) {
      setWebhookMessage("Please enter a URL")
      setWebhookStatus("error")
      return
    }

    setWebhookStatus("loading")
    try {
      const response = await fetch("/api/telegram/set-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (response.ok) {
        setWebhookStatus("success")
        setWebhookMessage(`Webhook set to: ${data.webhookUrl}`)
      } else {
        setWebhookStatus("error")
        setWebhookMessage(data.error || "Failed to set webhook")
      }
    } catch {
      setWebhookStatus("error")
      setWebhookMessage("Network error. Please try again.")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    {
      title: "Create Bot with BotFather",
      description: "Open Telegram, search for @BotFather, and send /newbot to create your bot",
      link: "https://t.me/BotFather",
      completed: false,
    },
    {
      title: "Set Bot Token",
      description: "Copy the token from BotFather and add it as TELEGRAM_BOT_TOKEN in your environment variables",
      completed: false,
    },
    {
      title: "Deploy Your App",
      description: "Deploy this app to Vercel or your preferred hosting platform",
      completed: !!deployedUrl,
    },
    {
      title: "Set Webhook",
      description: "Configure Telegram to send updates to your deployed app",
      completed: webhookStatus === "success",
    },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">RefoundNUS Bot Setup</h1>
          <p className="mt-2 text-muted-foreground">Follow these steps to get your Telegram bot up and running.</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card key={index} className={step.completed ? "border-green-500/50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {step.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      Step {index + 1}: {step.title}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              {step.link && (
                <CardContent>
                  <Button variant="outline" asChild>
                    <a href={step.link} target="_blank" rel="noopener noreferrer">
                      Open BotFather <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set Webhook</CardTitle>
            <CardDescription>
              Configure the webhook URL for your Telegram bot. This tells Telegram where to send messages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL (leave empty to use current domain)</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook-url"
                  placeholder={deployedUrl || "https://your-app.vercel.app"}
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl || deployedUrl)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={setWebhook} disabled={webhookStatus === "loading"}>
              {webhookStatus === "loading" ? "Setting Webhook..." : "Set Webhook"}
            </Button>

            {webhookMessage && (
              <p className={`text-sm ${webhookStatus === "success" ? "text-green-600" : "text-red-600"}`}>
                {webhookMessage}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Bot Commands</CardTitle>
            <CardDescription>
              These commands are available in your bot. You can set them in BotFather using /setcommands.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <p>start - Start the bot and see welcome message</p>
              <p>help - Show help and available commands</p>
              <p>lost - Report a lost item</p>
              <p>found - Report a found item</p>
              <p>browse - Browse all items</p>
              <p>search - Search for items</p>
              <p>my - View your reported items</p>
            </div>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() =>
                copyToClipboard(
                  `start - Start the bot and see welcome message
help - Show help and available commands
lost - Report a lost item
found - Report a found item
browse - Browse all items
search - Search for items
my - View your reported items`,
                )
              }
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copy Commands for BotFather
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adding New Functions</CardTitle>
            <CardDescription>Here's how to add new commands and features to your bot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">1. Add a new command</h4>
              <p className="text-sm text-muted-foreground">
                Edit <code className="bg-muted px-1 rounded">lib/telegram/handlers/commands.ts</code> and add a new case
                in the switch statement.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">2. Add new callback handlers</h4>
              <p className="text-sm text-muted-foreground">
                Edit <code className="bg-muted px-1 rounded">lib/telegram/handlers/callback.ts</code> to handle inline
                keyboard button presses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">3. Add new conversation flows</h4>
              <p className="text-sm text-muted-foreground">
                Edit <code className="bg-muted px-1 rounded">lib/telegram/handlers/conversation-flow.ts</code> for
                multi-step interactions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">4. Update messages</h4>
              <p className="text-sm text-muted-foreground">
                Edit <code className="bg-muted px-1 rounded">lib/telegram/messages.ts</code> to add or modify bot
                messages.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
