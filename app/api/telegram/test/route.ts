import { NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chatId = searchParams.get("chat_id")

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
  }

  if (!chatId) {
    return NextResponse.json(
      {
        error: "Missing chat_id parameter",
        usage: "Add ?chat_id=YOUR_TELEGRAM_USER_ID to the URL",
        hint: "You can get your chat ID by messaging @userinfobot on Telegram",
      },
      { status: 400 },
    )
  }

  // Try to send a test message
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🎉 *Test Successful!*\n\nYour bot is working! The webhook connection is the issue.\n\nTry sending /start again.",
        parse_mode: "Markdown",
      }),
    })

    const result = await response.json()

    if (result.ok) {
      return NextResponse.json({
        success: true,
        message: "Test message sent! Check your Telegram.",
        result,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.description,
          result,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
