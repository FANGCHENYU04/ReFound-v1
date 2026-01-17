import { type NextRequest, NextResponse } from "next/server"
import { setWebhook } from "@/lib/telegram/api"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const webhookUrl = `${url}/api/telegram/webhook`
    const success = await setWebhook(webhookUrl)

    if (success) {
      return NextResponse.json({ message: "Webhook set successfully", webhookUrl })
    } else {
      return NextResponse.json({ error: "Failed to set webhook" }, { status: 500 })
    }
  } catch (error) {
    console.error("Set webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET handler for easy setup via browser
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json(
      {
        error: "URL parameter required",
        usage: "/api/telegram/set-webhook?url=https://your-domain.com",
      },
      { status: 400 },
    )
  }

  const webhookUrl = `${url}/api/telegram/webhook`
  const success = await setWebhook(webhookUrl)

  if (success) {
    return NextResponse.json({ message: "Webhook set successfully", webhookUrl })
  } else {
    return NextResponse.json({ error: "Failed to set webhook" }, { status: 500 })
  }
}
