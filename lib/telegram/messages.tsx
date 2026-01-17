export const MESSAGES = {
  // Welcome and Help
  WELCOME: `🎉 <b>Welcome to ReFoundNUS Bot!</b>

I help connect lost items with their owners on campus.

<b>Commands:</b>
/lost - Report a lost item
/found - Report a found item
/browse - Browse all items
/search - Search for items
/my - View your reported items
/help - Show this help message

What would you like to do?`,

  HELP: `<b>ReFoundNUS Bot Help</b>

<b>Commands:</b>
/lost - Report something you lost
/found - Report something you found
/browse - Browse all active items
/search - Search items by keyword
/my - View and manage your items
/cancel - Cancel current operation
/help - Show this message

<b>Tips:</b>
• Add photos to help identify items
• Be specific with descriptions
• Check regularly for matches`,

  // Report Flow
  REPORT_START_LOST: `📝 <b>Report a Lost Item</b>

Let's help you find your item! First, select a category:`,

  REPORT_START_FOUND: `📝 <b>Report a Found Item</b>

Great that you want to help! First, select a category:`,

  ENTER_TITLE: `✏️ Enter a short title for the item (e.g., "Blue iPhone 14", "Black Wallet"):`,

  ASK_DESCRIPTION: `📝 Describe the item in detail:
• Color, brand, size
• Distinguishing features
• Any unique marks or damage`,

  ASK_LOCATION: `📍 Where was the item lost/found? Select a location:`,

  ASK_DATE: `📅 When did this happen?

Enter a date like:
• "today" or "yesterday"
• "Monday" or "last Friday"
• "Jan 15" or "15/1/2024"`,

  INVALID_DATE: `❌ I couldn't understand that date. Please try again with formats like:
• "today" or "yesterday"
• "Monday" or "last Friday"
• "Jan 15" or "15/1/2024"`,

  ASK_PHOTOS: `📷 Upload a photo of the item to help identify it.

Type /skip if you don't have a photo, or /done when finished uploading.`,

  PHOTO_RECEIVED: `✅ Photo received! Upload another, or type /done to finish.`,

  ITEM_CREATED_LOST: `✅ <b>Lost item report created!</b>

We'll notify you if we find potential matches. You can view your items with /my.`,

  ITEM_CREATED_FOUND: `✅ <b>Found item report created!</b>

We'll notify you if someone claims this item. You can view your items with /my.`,

  // Browse
  BROWSE_HEADER: `📋 <b>Browse Items</b>

Select what you want to see:`,

  NO_ITEMS: `📭 No items found.`,

  // Search
  ASK_SEARCH_QUERY: `🔍 <b>Search Items</b>

Enter keywords to search for (e.g., "blue wallet", "iPhone", "keys"):`,

  SEARCH_RESULTS_HEADER: `🔍 <b>Search Results:</b>

`,

  NO_SEARCH_RESULTS: `😕 No items found matching your search. Try different keywords or /browse all items.`,

  // My Items
  MY_ITEMS_HEADER: `📦 <b>Your Items:</b>

`,

  NO_MY_ITEMS: `📭 You haven't reported any items yet.

Use /lost to report a lost item or /found to report something you found.`,

  // Claims
  CLAIM_REASON: `📝 Please describe why you believe this is your item:
• Specific details only the owner would know
• Any identifying marks
• When/where you lost it`,

  CLAIM_SUBMITTED: `✅ <b>Claim submitted!</b>

The item reporter will be notified and can contact you if approved.`,

  CLAIM_ALREADY_EXISTS: `⚠️ You've already submitted a claim for this item. Please wait for the owner to respond.`,

  // Item Management
  ITEM_DELETED: `🗑️ Item has been deleted.`,

  ITEM_SAVED: `✅ Your item has been saved!`,

  // Status Messages
  ERROR: `❌ Something went wrong. Please try again or use /cancel to start over.`,

  CANCELLED: `❌ Operation cancelled. Use /help to see available commands.`,

  BANNED: `🚫 Your account has been restricted. Contact an administrator for help.`,

  ADMIN_ONLY: `🔒 This command is only available to administrators.`,

  // Notifications
  NEW_MATCH_FOUND: `🔔 <b>Potential Match Found!</b>

We found an item that might match yours. Check it out:`,

  NEW_CLAIM_RECEIVED: `🔔 <b>New Claim Received!</b>

Someone has claimed your item. Review their claim:`,
}

export const CATEGORIES = [
  { id: "electronics", label: "Electronics", emoji: "📱" },
  { id: "clothing", label: "Clothing", emoji: "👕" },
  { id: "bags_wallets", label: "Bags & Wallets", emoji: "👜" },
  { id: "keys", label: "Keys", emoji: "🔑" },
  { id: "id_cards", label: "ID & Cards", emoji: "💳" },
  { id: "books", label: "Books & Stationery", emoji: "📚" },
  { id: "accessories", label: "Accessories", emoji: "⌚" },
  { id: "sports", label: "Sports Equipment", emoji: "⚽" },
  { id: "other", label: "Other", emoji: "📦" },
]

export const LOCATIONS = [
  { id: "library", label: "Library" },
  { id: "utown", label: "UTown" },
  { id: "science", label: "Faculty of Science" },
  { id: "engineering", label: "Faculty of Engineering" },
  { id: "arts", label: "Faculty of Arts" },
  { id: "business", label: "Business School" },
  { id: "computing", label: "School of Computing" },
  { id: "law", label: "Faculty of Law" },
  { id: "canteen", label: "Canteens" },
  { id: "sports", label: "Sports Facilities" },
  { id: "bus_stop", label: "Bus Stops" },
  { id: "other", label: "Other" },
]

export function formatItemListItem(item: {
  id: string
  type: string
  title: string
  category: string
  location: string
  created_at: string
}): string {
  const category = CATEGORIES.find((c) => c.id === item.category)
  const emoji = category?.emoji || "📦"
  const type = item.type === "lost" ? "🔴 LOST" : "🟢 FOUND"
  const date = new Date(item.created_at).toLocaleDateString()

  return `${emoji} <b>${type}:</b> ${item.title}
📍 ${item.location} | 📅 ${date}`
}

export function formatItemDetail(item: {
  id: string
  type: string
  title: string
  description: string
  category: string
  location: string
  date_occurred: string
  created_at: string
  status: string
}): string {
  const category = CATEGORIES.find((c) => c.id === item.category)
  const emoji = category?.emoji || "📦"
  const type = item.type === "lost" ? "🔴 LOST" : "🟢 FOUND"
  const statusEmoji = item.status === "active" ? "✅" : item.status === "claimed" ? "🎉" : "❌"

  return `${emoji} <b>${type}: ${item.title}</b>

📝 <b>Description:</b> ${item.description || "No description"}
📍 <b>Location:</b> ${item.location}
📅 <b>Date:</b> ${new Date(item.date_occurred).toLocaleDateString()}
${statusEmoji} <b>Status:</b> ${item.status}

<i>Posted: ${new Date(item.created_at).toLocaleDateString()}</i>`
}

export function formatMatchesMessage(
  matches: Array<{
    item: { id: string; title: string; type: string; location: string }
    score: number
  }>,
): string {
  if (matches.length === 0) {
    return "No potential matches found yet."
  }

  let message = "🔍 <b>Potential Matches Found:</b>\n\n"
  matches.forEach((match, index) => {
    const type = match.item.type === "lost" ? "🔴 Lost" : "🟢 Found"
    message += `${index + 1}. ${type}: ${match.item.title}\n   📍 ${match.item.location}\n   Match: ${Math.round(match.score * 100)}%\n\n`
  })

  return message
}
