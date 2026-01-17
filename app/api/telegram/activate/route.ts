import { NextResponse } from "next/server"
import { setWebhook, getWebhookInfo, deleteWebhook } from "@/lib/telegram/api"

export const dynamic = "force-dynamic"

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`
  const webhookUrl = `${baseUrl}/api/telegram/webhook`
  const botLink = "https://t.me/ReFoundNUSv1_bot"

  console.log("[v0] Activation started")
  console.log("[v0] Target webhook URL:", webhookUrl)

  try {
    // Check current webhook status
    const webhookInfo = await getWebhookInfo()
    console.log("[v0] Current webhook info:", JSON.stringify(webhookInfo))

    // If webhook is already set to current URL, we're done
    if (webhookInfo?.url === webhookUrl) {
      return NextResponse.json({
        success: true,
        message: "Bot is already activated!",
        webhookUrl,
        botLink,
      })
    }

    // Delete old webhook first to avoid conflicts
    if (webhookInfo?.url) {
      console.log("[v0] Deleting old webhook:", webhookInfo.url)
      await deleteWebhook()
      await delay(2000) // Wait 2 seconds after delete
    }

    // Try to set webhook with retries
    let lastError = ""
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`[v0] Attempt ${attempt} to set webhook`)

      const result = await setWebhook(webhookUrl)

      if (result.success) {
        console.log("[v0] Webhook set successfully!")
        return NextResponse.json({
          success: true,
          message: "Bot activated successfully!",
          webhookUrl,
          botLink,
          attempt,
        })
      }

      lastError = result.message
      console.log(`[v0] Attempt ${attempt} failed:`, result.message)

      if (attempt < 3) {
        const waitTime = attempt * 2000 // 2s, 4s
        console.log(`[v0] Waiting ${waitTime}ms before retry`)
        await delay(waitTime)
      }
    }

    // All retries failed - check if webhook got set anyway
    const finalCheck = await getWebhookInfo()
    if (finalCheck?.url === webhookUrl) {
      return NextResponse.json({
        success: true,
        message: "Bot activated (verified on final check)!",
        webhookUrl,
        botLink,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: `Failed after 3 attempts: ${lastError}`,
        currentWebhook: finalCheck?.url || "none",
        targetWebhook: webhookUrl,
        botLink,
        hint: "Wait 1-2 minutes and try again, or check if TELEGRAM_BOT_TOKEN is correct in Vars.",
      },
      { status: 500 },
    )
  } catch (error) {
    console.error("[v0] Activation error:", error)
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
