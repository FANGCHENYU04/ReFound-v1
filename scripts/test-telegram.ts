const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = "329336269"

async function testBot() {
  console.log("[v0] Testing Telegram bot...")
  console.log("[v0] Token ends with:", TELEGRAM_BOT_TOKEN?.slice(-10))

  if (!TELEGRAM_BOT_TOKEN) {
    console.log("[v0] ERROR: No TELEGRAM_BOT_TOKEN found!")
    return
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: "🎉 *Test Successful!*\n\nYour ReFoundNUSv1 bot is working!\n\nTry these commands:\n• /start - Welcome message\n• /lost - Report lost item\n• /found - Report found item\n• /browse - Browse items",
        parse_mode: "Markdown",
      }),
    })

    const data = await response.json()
    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response:", JSON.stringify(data, null, 2))

    if (data.ok) {
      console.log("[v0] SUCCESS! Message sent to Telegram!")
    } else {
      console.log("[v0] FAILED:", data.description)
    }
  } catch (error) {
    console.log("[v0] Error:", error)
  }
}

testBot()
