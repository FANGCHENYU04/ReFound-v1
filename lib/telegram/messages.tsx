import type { DbItem } from "./types"

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
/search - Search items
/my - View your items
/help - Show this message`,

  HELP: `<b>ReFound NUS Commands:</b>

/start - Welcome message
/lost - Report a lost item
/found - Report a found item
/browse - Browse all items
/search - Search items by keyword
/my - View your reported items
/cancel - Cancel current action
/help - Show this help`,

  ERROR: "Something went wrong. Please try again or use /cancel to start over.",

  BANNED: "Your account has been suspended. Please contact support.",

  CANCELLED: "Action cancelled. Use /help to see available commands.",

  REPORT_START_LOST: `<b>Report a Lost Item</b>

Let's help you find your item! First, select a category:`,

  REPORT_START_FOUND: `<b>Report a Found Item</b>

Great that you found something! Let's help return it to its owner. Select a category:`,

  ASK_TITLE: "What is the item? Please provide a brief title (e.g., 'Blue iPhone 15', 'Black Laptop Bag'):",

  ASK_DESCRIPTION: `Please describe the item in detail. Include:
- Color, brand, size
- Any distinguishing features
- Contents (if applicable)

Type /skip to skip this step.`,

  ASK_LOCATION: "Where did you lose/find this item? Select a location:",

  ASK_LOCATION_DETAIL:
    "Please provide more specific details about the location (e.g., 'Near the main entrance', '3rd floor study area').\n\nType /skip to skip.",

  ASK_DATE: `When did this happen?

You can type:
- <b>today</b>
- <b>yesterday</b>
- Or a date like <b>2024-01-15</b>`,

  ASK_PHOTOS: `Would you like to add photos of the item?

Send photos now, or type /done when finished.
Type /skip to skip adding photos.`,

  PHOTO_RECEIVED: "Photo received! Send more photos or type /done to finish.",

  INVALID_DATE: "Invalid date format. Please use YYYY-MM-DD format, or type 'today' or 'yesterday'.",

  ITEM_CREATED_LOST: `<b>Lost item reported!</b>

Your item has been added to the database. We'll notify you if someone reports finding a matching item.

Use /my to view your reported items.`,

  ITEM_CREATED_FOUND: `<b>Found item reported!</b>

Thank you for helping! Your item has been added to the database. We'll notify you if someone reports losing a matching item.

Use /my to view your reported items.`,

  BROWSE_HEADER: `<b>Browse Items</b>

Select what type of items you want to see:`,

  NO_ITEMS_FOUND: "No items found matching your criteria.",

  ASK_SEARCH_QUERY: "What are you looking for? Enter keywords to search:",

  SEARCH_RESULTS_HEADER: "<b>Search Results:</b>\n\n",

  NO_SEARCH_RESULTS: "No items found matching your search. Try different keywords.",

  MY_ITEMS_HEADER: "<b>Your Reported Items:</b>\n\n",

  NO_MY_ITEMS:
    "You haven't reported any items yet.\n\nUse /lost to report a lost item or /found to report a found item.",

  CLAIM_START: "To claim this item, please describe how you can prove it's yours:",

  CLAIM_SUBMITTED: `<b>Claim submitted!</b>

The owner will be notified and will review your claim. You'll be notified once they respond.`,

  CLAIM_ALREADY_EXISTS: "You have already submitted a claim for this item.",

  ITEM_DELETED: "Item has been deleted.",

  ADMIN_ONLY: "This command is only available to administrators.",

  MATCH_NOTIFICATION: `<b>Potential Match Found!</b>

We found an item that might match what you're looking for. Check it out:`,
}

export function formatItemListItem(item: DbItem, index?: number): string {
  const prefix = index ? `${index}. ` : ""
  const emoji = item.type === "lost" ? "🔴" : "🟢"
  const date = new Date(item.happened_at).toLocaleDateString()

  return `${prefix}${emoji} <b>${item.title}</b>
   Category: ${item.category}
   Location: ${item.location_name}
   Date: ${date}`
}

export function formatItemDetail(item: DbItem): string {
  const emoji = item.type === "lost" ? "🔴 LOST" : "🟢 FOUND"
  const date = new Date(item.happened_at).toLocaleDateString()

  let detail = `<b>${emoji}</b>

<b>${item.title}</b>

<b>Category:</b> ${item.category}
<b>Location:</b> ${item.location_name}
<b>Date:</b> ${date}`

  if (item.description) {
    detail += `\n\n<b>Description:</b>\n${item.description}`
  }

  return detail
}

export function formatMatchesMessage(items: DbItem[]): string {
  if (items.length === 0) {
    return "No potential matches found."
  }

  let message = "<b>Potential Matches:</b>\n\n"
  items.forEach((item, index) => {
    message += formatItemListItem(item, index + 1) + "\n\n"
  })
  return message
}
