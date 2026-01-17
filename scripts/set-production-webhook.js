const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const PRODUCTION_URL = "https://v0-telegram-bot-creation-three-sand.vercel.app"
const WEBHOOK_URL = `${PRODUCTION_URL}/api/telegram/webhook`
const CHAT_ID = "329336269"

async function main() {
  console.log("[v0] Setting production webhook...")
  console.log("[v0] URL:", WEBHOOK_URL)

  // Delete old webhook first
  const deleteRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`)
  const deleteData = await deleteRes.json()
  console.log("[v0] Delete old webhook:", deleteData.ok ? "Success" : deleteData.description)

  // Wait a moment
  await new Promise((r) => setTimeout(r, 1000))

  // Set new webhook
  const setRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: WEBHOOK_URL,
      allowed_updates: ["message", "callback_query"],
    }),
  })
  const setData = await setRes.json()
  console.log("[v0] Set webhook:", setData.ok ? "Success" : setData.description)

  // Verify
  const infoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
  const infoData = await infoRes.json()
  console.log("[v0] Webhook URL:", infoData.result?.url)
  console.log("[v0] Pending updates:", infoData.result?.pending_update_count)

  // Send test message
  const msgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: "✅ Production webhook set!\n\nURL: " + WEBHOOK_URL + "\n\nTry /start now!",
    }),
  })
  const msgData = await msgRes.json()
  console.log("[v0] Test message sent:", msgData.ok ? "Success" : msgData.description)
}

main()
