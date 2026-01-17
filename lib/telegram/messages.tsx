// Bot Messages Constants
export const MESSAGES = {
  WELCOME: `🎉 <b>Welcome to ReFound NUS!</b>

Your campus lost & found assistant is ready!

<b>What I can do:</b>
📝 Report lost or found items
🔍 Browse and search items
🔔 Get notified when matches are found
✅ Claim items that belong to you

Use the buttons below or type a command to get started!`,

  HELP: `<b>📚 ReFound NUS Help</b>

<b>Commands:</b>
/start - Welcome message
/lost - Report a lost item
/found - Report a found item
/browse - Browse all items
/search - Search for items
/my - View your items
/cancel - Cancel current action
/help - Show this help

<b>How it works:</b>
1. Report your lost/found item
2. Add photos and description
3. Get notified of potential matches
4. Connect with item owners`,

  REPORT_START_LOST: `📝 <b>Let's report your lost item.</b>

First, select a category:`,

  REPORT_START_FOUND: `📦 <b>Let's report an item you found.</b>

First, select a category:`,

  ASK_TITLE: `<b>Title</b>

What is the item? Give a short, clear title.

<i>Example: "Blue iPhone 14 Pro" or "Black Laptop Bag"</i>`,

  ASK_DESCRIPTION: `<b>Description</b>

Describe the item in detail. Include:
• Color, brand, size
• Any unique features
• Condition

The more details, the better the match!`,

  ASK_LOCATION: `<b>Location</b>

Where did you lose/find this item?`,

  ASK_DATE: `<b>Date</b>

When did this happen? Send a date or click below.

<i>Format: YYYY-MM-DD (e.g., 2024-01-15)</i>`,

  ASK_PHOTOS: `<b>Photos</b>

Send photos of the item to help with identification. You can send multiple photos.

When done, send /done to finish or /skip to skip photos.`,

  PHOTO_RECEIVED: `Photo received! Send more photos or /done to finish.`,

  ITEM_CREATED: `✅ <b>Item reported successfully!</b>

Your item has been added to the database. You'll be notified if a potential match is found.

Use /browse to see all items or /my to view your items.`,

  MATCHES_FOUND: `🎯 <b>Potential Matches Found!</b>

We found items that might match yours:`,

  NO_MATCHES: `No potential matches found yet. We'll notify you if something comes up!`,

  BROWSE_HEADER: `🔍 <b>Browse Items</b>

Here are the latest items:`,

  NO_ITEMS: `No items found. Be the first to report one with /lost or /found!`,

  MY_ITEMS_HEADER: `📋 <b>Your Items</b>`,

  NO_MY_ITEMS: `You haven't reported any items yet. Use /lost or /found to get started!`,

  CLAIM_PROMPT: `🙋 <b>Claim This Item</b>

Please describe why you believe this item is yours. Include any identifying details that prove ownership.`,

  CLAIM_SENT: `✅ <b>Claim Submitted!</b>

The item owner has been notified. They will contact you if your claim is verified.`,

  NEW_CLAIM: `🔔 <b>New Claim on Your Item!</b>

Someone has claimed your item. Review their message and contact them if verified.`,

  ERROR: `❌ Something went wrong. Please try again or use /cancel to start over.`,

  CANCELLED: `❌ Action cancelled. Use /start to begin again.`,

  UNKNOWN_COMMAND: `I don't recognize that command. Try /help for available commands.`,

  UNKNOWN_ACTION: `Unknown action`,

  ADMIN_ONLY: `This command is only available for admins.`,

  BANNED: `Your account has been restricted. Contact support for assistance.`,

  ASK_SEARCH_QUERY: `🔍 <b>Search Items</b>

Enter your search query:`,

  SEARCH_RESULTS: `🔍 <b>Search Results</b>`,

  NO_SEARCH_RESULTS: `No items found matching your search.`,
}

// Database Item Interface
export interface DbItem {
  id: string
  user_id: string
  type: "lost" | "found"
  category: string
  title: string
  description: string | null
  location_name: string | null
  happened_at: string | null
  state: "active" | "claimed" | "resolved" | "deleted"
  created_at: string
  updated_at: string
}

// Format a single item for list display
export function formatItemListItem(item: DbItem, index: number): string {
  const emoji = item.type === "lost" ? "🔴" : "🟢"
  const typeLabel = item.type === "lost" ? "LOST" : "FOUND"
  const date = item.happened_at ? new Date(item.happened_at).toLocaleDateString() : "Unknown date"

  return `${index}. ${emoji} <b>${item.title}</b>
   📁 ${item.category} | 📍 ${item.location_name || "Unknown"} | 📅 ${date}
   <i>${typeLabel}</i>`
}

// Format a single item for detail view
export function formatItemDetail(item: DbItem): string {
  const emoji = item.type === "lost" ? "🔴" : "🟢"
  const typeLabel = item.type === "lost" ? "LOST" : "FOUND"
  const date = item.happened_at ? new Date(item.happened_at).toLocaleDateString() : "Unknown date"

  return `${emoji} <b>${item.title}</b>

<b>Type:</b> ${typeLabel}
<b>Category:</b> ${item.category}
<b>Location:</b> ${item.location_name || "Not specified"}
<b>Date:</b> ${date}
<b>Status:</b> ${item.state}

<b>Description:</b>
${item.description || "No description provided."}`
}

// Format matches message
export function formatMatchesMessage(matches: DbItem[]): string {
  if (matches.length === 0) {
    return MESSAGES.NO_MATCHES
  }

  const matchList = matches.map((item, i) => formatItemListItem(item, i + 1)).join("\n\n")
  return `${MESSAGES.MATCHES_FOUND}\n\n${matchList}`
}
