const BOT_TOKEN = "7972015033:AAHOeULN77E9LGzRzKR7Ad8aeaHMmO29bMA"
const CHAT_ID = "329336269"
const PRODUCTION_URL = "https://v0-telegram-bot-creation-three-sand.vercel.app"
const WEBHOOK_URL = `${PRODUCTION_URL}/api/telegram/webhook`

async function setupProduction() {
  console.log("=== Setting up Production Webhook ===\n")
  console.log(`Production URL: ${PRODUCTION_URL}`)
  console.log(`Webhook URL: ${WEBHOOK_URL}\n`)

  // Step 1: Delete any existing webhook
  console.log("Step 1: Deleting old webhook...")
  const deleteResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, { method: "POST" })
  const deleteResult = await deleteResponse.json()
  console.log("Delete result:", deleteResult.ok ? "Success" : "Failed")

  // Wait a moment
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Step 2: Set new webhook to production URL
  console.log("\nStep 2: Setting production webhook...")
  const setResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: WEBHOOK_URL,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: true,
    }),
  })
  const setResult = await setResponse.json()
  console.log("Set webhook result:", setResult)

  // Step 3: Verify webhook
  console.log("\nStep 3: Verifying webhook...")
  const infoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
  const infoResult = await infoResponse.json()
  console.log("Webhook info:", JSON.stringify(infoResult, null, 2))

  // Step 4: Send confirmation message
  console.log("\nStep 4: Sending confirmation message...")
  const message = `🚀 *Production Bot Activated!*

Your ReFound NUS bot is now live at:
\`${PRODUCTION_URL}\`

The webhook is permanently set - no more refreshing needed!

*Test the bot by sending:*
• /start - Welcome message
• /lost - Report a lost item
• /found - Report a found item
• /browse - Browse all items
• /help - Show all commands`

  const sendResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    }),
  })
  const sendResult = await sendResponse.json()
  console.log("Message sent:", sendResult.ok ? "Success" : "Failed")

  console.log("\n=== Production Setup Complete ===")
  console.log("Your bot is now live and ready to use!")
}

setupProduction().catch(console.error)
