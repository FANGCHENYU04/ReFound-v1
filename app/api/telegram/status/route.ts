import { NextResponse } from "next/server"
import { getWebhookInfo } from "@/lib/telegram/api"

export const dynamic = "force-dynamic"

export async function GET() {
  const botLink = "https://t.me/ReFoundNUSv1_bot"

  try {
    const webhookInfo = await getWebhookInfo()

    return NextResponse.json({
      success: true,
      webhookUrl: webhookInfo?.url || null,
      isSet: !!webhookInfo?.url,
      pendingUpdates: webhookInfo?.pending || 0,
      lastError: webhookInfo?.last_error_message || null,
      botLink,
      message: webhookInfo?.url
        ? "Webhook is configured. Try sending /start to your bot!"
        : "No webhook set. Click Activate Bot to set it up.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        botLink,
      },
      { status: 500 },
    )
  }
}
