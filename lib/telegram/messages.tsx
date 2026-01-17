import type { DbItem } from "./types"

// All bot messages
export const MESSAGES = {
  WELCOME: `<b>Welcome to ReFound NUS!</b>

Your campus lost & found assistant is ready!

<b>What I can do:</b>
- Report lost or found items
- Browse and search items
- Get notified when matches are found
- Claim items that belong to you

<b>Commands:</b>
/lost - Report a lost item
/found - Report a found item
/browse - Browse all items
/search - Search for items
/my - View your items
/help - Show this message`,

  HELP: `<b>ReFound NUS Commands:</b>

/lost - Report a lost item
/found - Report a found item
/browse - Browse all items
/search - Search for items
/my - View your reported items
/cancel - Cancel current action

Need help? Contact @ReFoundNUS_Support`,

  ERROR: "Something went wrong. Please try again or use /cancel to start over.",

  BANNED: "Your account has been suspended. Contact support for assistance.",

  CANCELLED: "Action cancelled. Use /help to see available commands.",

  REPORT_START_LOST: `<b>Report Lost Item</b>

Let's help you find your item! First, select a category:`,

  REPORT_START_FOUND: `<b>Report Found Item</b>

Thank you for helping! First, select the item category:`,

  ASK_TITLE: `<b>Item Title</b>

Please enter a short, descriptive title for the item (e.g., "Blue iPhone 15 Pro" or "Black Leather Wallet"):`,

  ASK_DESCRIPTION: `<b>Description</b>

Add more details about the item (color, brand, distinguishing features, etc.).

Send /skip if you don't want to add a description.`,

  ASK_LOCATION: `<b>Location</b>

Where did you lose/find this item? Select a location:`,

  ASK_LOCATION_DETAIL: `<b>Location Details</b>

Please provide more specific details about the location (e.g., "Near the water fountain on level 2").

Send /skip if you don't have more details.`,

  ASK_DATE: `<b>Date</b>

When did this happen? You can type:
- "today"
- "yesterday"
- A date like "2025-01-15"`,

  INVALID_DATE: `Invalid date format. Please enter:
- "today"
- "yesterday"
- A date like "2025-01-15"`,

  ASK_PHOTOS: `<b>Photos</b>

Send photos of the item to help with identification. You can send multiple photos.

When done, send /done to finish or /skip to skip photos.`,

  PHOTO_RECEIVED: "Photo received! Send more photos or /done to finish.",

  ITEM_CREATED_LOST: `<b>Lost item reported!</b>

Your item has been added to our database. We'll notify you if someone reports finding a similar item.

Use /my to view or edit your items.`,

  ITEM_CREATED_FOUND: `<b>Found item reported!</b>

Thank you for helping! The owner will be notified if they're looking for this item.

Use /my to view or edit your items.`,

  BROWSE_HEADER: `<b>Browse Items</b>

What would you like to see?`,

  NO_ITEMS: "No items found. Check back later or try a different filter.",

  NO_MY_ITEMS: `You haven't reported any items yet.

Use /lost to report a lost item or /found to report a found item.`,

  MY_ITEMS_HEADER: `<b>Your Items</b>

Here are your reported items:\n`,

  ASK_SEARCH_QUERY: `<b>Search Items</b>

Enter keywords to search for (e.g., "iPhone", "blue wallet", "keys"):`,

  NO_SEARCH_RESULTS: "No items found matching your search. Try different keywords.",

  SEARCH_RESULTS_HEADER: `<b>Search Results</b>\n\n`,

  ASK_CLAIM_MESSAGE: `<b>Claim This Item</b>

To verify ownership, please answer the verification question or describe any unique identifying features of the item:`,

  CLAIM_SUBMITTED: `<b>Claim Submitted!</b>

The item owner will review your claim and contact you if verified.`,

  CLAIM_ALREADY_EXISTS: "You've already submitted a claim for this item. Please wait for a response.",

  ADMIN_ONLY: "This command is only available for administrators.",
}

// Format a single item for list display
export function formatItemListItem(item: DbItem, index?: number): string {
  const prefix = index ? `${index}. ` : ""
  const typeEmoji = item.type === "lost" ? "🔴 Lost" : "🟢 Found"
  const date = new Date(item.happened_at).toLocaleDateString()

  return `${prefix}<b>${typeEmoji}</b>: ${escapeHtml(item.title)}
📍 ${escapeHtml(item.location_name)} | 📅 ${date}`
}

// Format item detail view
export function formatItemDetail(item: DbItem): string {
  const typeEmoji = item.type === "lost" ? "🔴 LOST" : "🟢 FOUND"
  const date = new Date(item.happened_at).toLocaleDateString()

  let message = `<b>${typeEmoji}: ${escapeHtml(item.title)}</b>\n\n`
  message += `📁 Category: ${escapeHtml(item.category)}\n`
  message += `📍 Location: ${escapeHtml(item.location_name)}\n`
  message += `📅 Date: ${date}\n`

  if (item.description) {
    message += `\n📝 Description:\n${escapeHtml(item.description)}\n`
  }

  return message
}

// Escape HTML special characters
function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
