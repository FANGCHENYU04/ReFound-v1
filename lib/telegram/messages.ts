import type { Item } from "./types"

export const MESSAGES = {
  WELCOME: `🎉 Welcome to ReFound NUS!

Your campus lost & found assistant is ready!

What I can do:
📝 Report lost or found items
🔍 Browse and search items
🔔 Get notified when matches are found
✅ Claim items that belong to you

Use the buttons below or type a command to get started!`,

  HELP: `📚 ReFound NUS Help

Commands:
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

  REPORT_START_LOST: `📝 Let's report your lost item.

First, select a category:`,

  REPORT_START_FOUND: `📦 Let's report an item you found.

First, select a category:`,

  ASK_TITLE: "What is the item? (e.g., 'Blue iPhone 14', 'Black Wallet')",

  ASK_DESCRIPTION: "Please provide a description of the item (color, brand, distinguishing features, etc.):",

  ASK_LOCATION: "Where did you lose/find this item? Select a location:",

  ASK_DATE: "When did this happen? (e.g., 'today', 'yesterday', '2024-01-15')",

  ASK_PHOTO: "Would you like to add a photo? Send a photo now, or type 'skip' to continue without one.",

  REPORT_SUCCESS: "✅ Your item has been reported successfully! We'll notify you if we find a match.",

  BROWSE_HEADER: "📋 Browse Items\n\nSelect a category to browse:",

  BROWSE_EMPTY: "No items found in this category.",

  ASK_SEARCH_QUERY: "🔍 What are you looking for? Enter keywords:",

  SEARCH_NO_RESULTS: "No items found matching your search.",

  NO_MY_ITEMS: "You haven't reported any items yet. Use /lost or /found to report an item.",

  MY_ITEMS_HEADER: "📁 Your Items\n\n",

  CLAIM_ASK_PROOF:
    "To claim this item, please describe proof of ownership (e.g., what's inside the wallet, phone lock screen, etc.):",

  CLAIM_SUBMITTED: "✅ Your claim has been submitted! The owner will be notified and can approve or reject your claim.",

  CLAIM_APPROVED: "✅ Claim approved! You can now contact each other to arrange pickup.",

  CLAIM_REJECTED: "❌ Claim rejected.",

  ITEM_DELETED: "🗑️ Item deleted successfully.",

  ADMIN_ONLY: "⚠️ This command is for admins only.",

  INVALID_DATE: "Invalid date format. Please use 'today', 'yesterday', or YYYY-MM-DD format.",

  MATCH_FOUND: "🔔 Potential match found! Check /my to see matches.",
}

export function formatItemListItem(item: Item, index: number): string {
  const emoji = item.item_type === "lost" ? "🔴" : "🟢"
  const date = item.happened_at ? new Date(item.happened_at).toLocaleDateString() : "Unknown date"
  return `${emoji} ${index + 1}. ${item.title}\n   📍 ${item.location_name || "Unknown"} | 📅 ${date}`
}

export function formatItemDetail(item: Item): string {
  const emoji = item.item_type === "lost" ? "🔴 LOST" : "🟢 FOUND"
  const date = item.happened_at ? new Date(item.happened_at).toLocaleDateString() : "Unknown date"

  let text = `${emoji}\n\n`
  text += `📦 ${item.title}\n\n`
  text += `📝 ${item.description || "No description"}\n\n`
  text += `📍 Location: ${item.location_name || "Unknown"}\n`
  text += `📅 Date: ${date}\n`
  text += `🏷️ Category: ${item.category || "Other"}\n`
  text += `📊 Status: ${item.state || "active"}`

  return text
}

export function formatMatchesMessage(matches: Item[]): string {
  if (matches.length === 0) return ""

  let text = "\n\n🔔 Potential Matches:\n"
  matches.forEach((match, i) => {
    text += formatItemListItem(match, i) + "\n"
  })
  return text
}
