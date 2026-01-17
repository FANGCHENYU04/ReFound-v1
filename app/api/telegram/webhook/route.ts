import { type NextRequest, NextResponse } from "next/server"
import type { TelegramUpdate } from "@/lib/telegram/types"
import { handleMessage } from "@/lib/telegram/handlers/message"
import { handleCallbackQuery } from "@/lib/telegram/handlers/callback"

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()

    console.log("[v0] Webhook received update:", JSON.stringify(update).slice(0, 200))

    if (update.message) {
      console.log("[v0] Processing message from:", update.message.from?.username || update.message.from?.id)
      await handleMessage(update.message)
      console.log("[v0] Message handled successfully")
    } else if (update.callback_query) {
      console.log("[v0] Processing callback query")
      await handleCallbackQuery(update.callback_query)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}

export async function GET() {
  return NextResponse.json({ status: "Bot webhook is active" })
}
