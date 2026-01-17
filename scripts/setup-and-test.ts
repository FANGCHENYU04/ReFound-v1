const BOT_TOKEN = "7972015033:AAHOeULN77E9LGzRzKR7Ad8aeaHMmO29bMA"
const CHAT_ID = "329336269"
const WEBHOOK_URL = "https://preview-telegram-bot-creation-kzmg28bf0gjm8bxv8goq.vusercontent.net/api/telegram/webhook"

async function main() {
  // Step 1: Delete old webhook
  console.log("Step 1: Deleting old webhook...")
  const deleteRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, { method: "POST" })
  const deleteData = await deleteRes.json()
  console.log("Delete result:", JSON.stringify(deleteData))

  // Wait 2 seconds
  await new Promise((r) => setTimeout(r, 2000))

  // Step 2: Set new webhook
  console.log("\nStep 2: Setting new webhook to:", WEBHOOK_URL)
  const setRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: WEBHOOK_URL }),
  })
  const setData = await setRes.json()
  console.log("Set webhook result:", JSON.stringify(setData))

  // Wait 1 second
  await new Promise((r) => setTimeout(r, 1000))

  // Step 3: Verify webhook
  console.log("\nStep 3: Verifying webhook...")
  const infoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
  const infoData = await infoRes.json()
  console.log("Webhook info:", JSON.stringify(infoData, null, 2))

  // Step 4: Send welcome message
  console.log("\nStep 4: Sending welcome message...")
  const welcomeMessage = `🎉 *Welcome to ReFound NUS!*

Your campus lost & found assistant is ready!

*What I can do:*
📝 Report lost or found items
🔍 Browse and search items
🔔 Get notified when matches are found
✅ Claim items that belong to you

Try sending /start to test the webhook!`

  const msgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: welcomeMessage,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📝 Report Lost Item", callback_data: "report_lost" },
            { text: "📦 Report Found Item", callback_data: "report_found" },
          ],
          [
            { text: "🔍 Browse Items", callback_data: "browse" },
            { text: "📋 My Items", callback_data: "my_items" },
          ],
        ],
      },
    }),
  })
  const msgData = await msgRes.json()
  console.log("Message sent:", msgData.ok ? "SUCCESS" : "FAILED")
  if (!msgData.ok) {
    console.log("Error:", msgData.description)
  }

  console.log("\n✅ Setup complete! Now try /start in Telegram.")
}

main().catch(console.error)
