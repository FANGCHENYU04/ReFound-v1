const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = "329336269"
const WEBHOOK_URL = "https://preview-telegram-bot-creation-kzmqoi7d345yjberxtue.vusercontent.net/api/telegram/webhook"

async function main() {
  console.log("Refreshing webhook...")
  console.log("Using webhook URL:", WEBHOOK_URL)

  // Delete old webhook
  const deleteRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`)
  const deleteData = await deleteRes.json()
  console.log("Delete webhook result:", deleteData)

  // Wait 2 seconds
  await new Promise((r) => setTimeout(r, 2000))

  // Set new webhook
  const setRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: WEBHOOK_URL }),
  })
  const setData = await setRes.json()
  console.log("Set webhook result:", setData)

  // Verify webhook
  const infoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
  const infoData = await infoRes.json()
  console.log("Webhook info:", infoData)

  // Send confirmation message
  const msgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: "✅ Webhook refreshed!\n\nTry /start now.",
      parse_mode: "HTML",
    }),
  })
  const msgData = await msgRes.json()
  console.log("Message sent:", msgData.ok)
}

main()
