import type { DbItem } from "./types"

export const MESSAGES = {
  WELCOME: `🎉 <b>Welcome to ReFound NUS!</b>

Your campus lost & found assistant is ready!

<b>What I can do:</b>
📝 Report lost or found items
🔍 Browse and search items
🔔 Get notified when matches are found
✅ Claim items that belong to you

Use the buttons below or type a command to get started!`,

  HELP: `📚 <b>ReFound NUS Help</b>

<b>Commands:</b>
• /start - Welcome message
• /lost - Report a lost item
• /found - Report a found item
• /browse - Browse all items
• /search - Search items
• /my - View your items
• /cancel - Cancel current action

Need help? Contact @ReFoundNUS_support`,

  ERROR: "❌ Something went wrong. Please try again or use /cancel to start over.",

  CANCELLED: "✅ Action cancelled. Use /start to see the menu.",

  BANNED: "⛔ Your account has been banned. Contact support if you believe this is an error.",

  REPORT_START_LOST: `📝 <b>Let's report your lost item.</b>

First, select a category:`,

  REPORT_START_FOUND: `📦 <b>Let's report an item you found.</b>

First, select a category:`,

  ASK_TITLE: `📝 <b>Title</b>

What is the item? Give it a short, descriptive title.

Example: "Blue iPhone 14 Pro" or "Black Leather Wallet"`,

  ASK_DESCRIPTION: `📝 <b>Description</b>

Please describe the item in detail (color, brand, distinguishing features, etc.)

Type /skip to skip this step.`,

  ASK_LOCATION: `📍 <b>Location</b>

Where did you lose/find this item? Select a location:`,

  ASK_LOCATION_DETAIL: `📍 <b>Location Details</b>

Any specific details about the location? (e.g., "near the entrance", "2nd floor")

Type /skip to skip this step.`,

  ASK_DATE: `📅 <b>Date</b>

When did this happen?

You can type:
• "today"
• "yesterday"  
• A date like "2024-01-15"`,

  ASK_PHOTOS: `📸 <b>Photos</b>

Send photos of the item to help with identification. You can send multiple photos.

When done, send /done to finish or /skip to skip photos.`,

  PHOTO_RECEIVED: "📸 Photo received! Send more photos or /done to finish.",

  INVALID_DATE: "❌ Invalid date format. Please use 'today', 'yesterday', or YYYY-MM-DD format.",

  ITEM_CREATED_LOST: `✅ <b>Lost item reported!</b>

Your item has been added to the database. We'll notify you if someone finds a matching item.

Use /my to view your reported items.`,

  ITEM_CREATED_FOUND: `✅ <b>Found item reported!</b>

Thank you for reporting this item! The owner will be notified if there's a match.

Use /my to view your reported items.`,

  BROWSE_HEADER: `📋 <b>Browse Items</b>

Select a category to browse:`,

  BROWSE_EMPTY: "📭 No items found in this category.",

  ASK_SEARCH_QUERY: `🔍 <b>Search</b>

What are you looking for? Enter keywords to search:`,

  SEARCH_RESULTS_HEADER: `🔍 <b>Search Results</b>\n\n`,

  NO_SEARCH_RESULTS: "🔍 No items found matching your search. Try different keywords.",

  NO_MY_ITEMS: `📭 <b>No Items</b>

You haven't reported any items yet.

Use /lost to report a lost item or /found to report an item you found.`,

  MY_ITEMS_HEADER: `📁 <b>Your Items</b>\n\n`,

  CLAIM_ASK_PROOF: `🙋 <b>Claim Item</b>

To claim this item, please describe proof of ownership.

For example:
• What's inside the bag/wallet?
• What's the phone's lock screen?
• Any unique marks or features?`,

  CLAIM_SUBMITTED: `✅ <b>Claim Submitted!</b>

Your claim has been sent to the item owner. They will review it and contact you if approved.`,

  CLAIM_ALREADY_EXISTS: "⚠️ You have already submitted a claim for this item.",

  CLAIM_APPROVED: "✅ Your claim has been approved! You can now contact the owner to arrange pickup.",

  CLAIM_REJECTED: "❌ Your claim has been rejected.",

  ITEM_DELETED: "🗑️ Item deleted successfully.",

  ADMIN_ONLY: "⚠️ This command is for admins only.",

  MATCH_FOUND: "🔔 <b>Potential match found!</b>\n\nCheck /my to see matches for your items.",
}

export function formatItemListItem(item: DbItem, index: number): string {
  const emoji = item.type === "lost" ? "🔴" : "🟢"
  const typeLabel = item.type === "lost" ? "Lost" : "Found"
  const date = item.happened_at ? new Date(item.happened_at).toLocaleDateString() : "Unknown date"
  return `${emoji} <b>${index}. ${item.title}</b> [${typeLabel}]\n   📍 ${item.location_name || "Unknown"} | 📅 ${date}`
}

export function formatItemDetail(item: DbItem): string {
  const emoji = item.type === "lost" ? "🔴 LOST" : "🟢 FOUND"
  const date = item.happened_at ? new Date(item.happened_at).toLocaleDateString() : "Unknown date"

  let text = `<b>${emoji}</b>\n\n`
  text += `📦 <b>${item.title}</b>\n\n`
  if (item.description) {
    text += `📝 ${item.description}\n\n`
  }
  text += `📍 <b>Location:</b> ${item.location_name || "Unknown"}\n`
  text += `📅 <b>Date:</b> ${date}\n`
  text += `🏷️ <b>Category:</b> ${item.category || "Other"}\n`
  text += `📊 <b>Status:</b> ${item.state || "active"}`

  return text
}

export function formatMatchesMessage(matches: DbItem[]): string {
  if (matches.length === 0) return ""

  let text = "\n\n🔔 <b>Potential Matches:</b>\n"
  matches.forEach((match, i) => {
    text += formatItemListItem(match, i + 1) + "\n"
  })
  return text
}
