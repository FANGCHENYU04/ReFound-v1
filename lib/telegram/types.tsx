export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramChat {
  id: number
  type: "private" | "group" | "supergroup" | "channel"
  title?: string
  username?: string
  first_name?: string
  last_name?: string
}

export interface TelegramPhotoSize {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  file_size?: number
}

export interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: TelegramChat
  date: number
  text?: string
  photo?: TelegramPhotoSize[]
  caption?: string
  location?: {
    latitude: number
    longitude: number
  }
}

export interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  message?: TelegramMessage
  chat_instance: string
  data?: string
}

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

export interface InlineKeyboardButton {
  text: string
  callback_data?: string
  url?: string
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][]
}

export interface SendMessageOptions {
  chat_id: number
  text: string
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2"
  reply_markup?: InlineKeyboardMarkup
}

// Database types
export interface DbUser {
  id: string
  tg_user_id: number
  username: string | null
  full_name: string
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface DbItem {
  id: string
  user_id: string
  type: "lost" | "found"
  category: string
  title: string
  description: string | null
  location_name: string
  lat: number | null
  lng: number | null
  happened_at: string
  state: "active" | "claimed" | "expired" | "deleted"
  verification_question: string | null
  created_at: string
  updated_at: string
}

export interface DbPhoto {
  id: string
  item_id: string
  telegram_file_id: string
  storage_url: string | null
  phash: string | null
  created_at: string
}

export interface DbClaim {
  id: string
  item_id: string
  claimant_user_id: string
  answer_text: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface ConversationState {
  id: string
  tg_user_id: number
  state: string
  flow_type: string | null
  data: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Categories for items
export const ITEM_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Bags & Wallets",
  "Keys",
  "ID & Cards",
  "Books & Stationery",
  "Accessories",
  "Sports Equipment",
  "Other",
] as const

// Campus locations
export const CAMPUS_LOCATIONS = [
  "Library",
  "Student Center",
  "Science Building",
  "Arts Building",
  "Engineering Hall",
  "Cafeteria",
  "Gym",
  "Parking Lot",
  "Bus Stop",
  "Dormitory",
  "Other",
] as const

export type ItemCategory = (typeof ITEM_CATEGORIES)[number]
export type CampusLocation = (typeof CAMPUS_LOCATIONS)[number]

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
/start - Show main menu
/lost - Report a lost item
/found - Report a found item
/browse - Browse all items
/search - Search for items
/my - View your items
/cancel - Cancel current action
/help - Show this help

<b>How it works:</b>
1. Report your lost/found item with details
2. AI matches similar items automatically
3. Get notified when a match is found
4. Claim your item and connect with the finder!`,

  REPORT_START_LOST: `📝 <b>Report Lost Item</b>

Let's report your lost item. First, select a category:`,

  REPORT_START_FOUND: `📦 <b>Report Found Item</b>

Great! Let's report the found item. First, select a category:`,

  ASK_TITLE: `<b>Title</b>

What is the item? Give it a short title (e.g., "Blue iPhone 15", "Black Wallet", "Silver Keys").`,

  ASK_DESCRIPTION: `<b>Description</b>

Provide more details about the item. Include:
• Color, brand, size
• Any distinguishing features
• Contents (if applicable)

This helps with matching!`,

  ASK_LOCATION: `<b>Location</b>

Where did you lose/find this item? Select a location:`,

  ASK_DATE: `<b>Date</b>

When did this happen? Enter the date (e.g., "today", "yesterday", or "2024-01-15"):`,

  ASK_PHOTOS: `<b>Photos</b>

Send photos of the item to help with identification. You can send multiple photos.

When done, send /done to finish or /skip to skip photos.`,

  PHOTO_RECEIVED: `Photo received! Send more photos or /done to finish.`,

  ITEM_CREATED: `✅ <b>Item Reported Successfully!</b>

Your item has been added to the database. Our AI will automatically look for matches and notify you if something similar is found.

Use /browse to see all items or /my to see your items.`,

  BROWSE_HEADER: `🔍 <b>Browse Items</b>

Here are the latest items:`,

  NO_ITEMS: `No items found. Be the first to report one!`,

  MY_ITEMS_HEADER: `📋 <b>Your Items</b>`,

  NO_MY_ITEMS: `You haven't reported any items yet. Use /lost or /found to report one!`,

  SEARCH_PROMPT: `🔎 <b>Search Items</b>

Enter keywords to search (e.g., "blue wallet", "iPhone", "keys"):`,

  SEARCH_RESULTS: `<b>Search Results:</b>`,

  NO_SEARCH_RESULTS: `No items found matching your search. Try different keywords!`,

  CLAIM_PROMPT: `🙋 <b>Claim Item</b>

To claim this item, please provide proof of ownership or describe something specific about the item that only the owner would know:`,

  CLAIM_SUBMITTED: `✅ <b>Claim Submitted!</b>

Your claim has been sent to the item reporter. They will review it and contact you if approved.`,

  MATCH_FOUND: `🎯 <b>Potential Match Found!</b>

We found an item that might be related to yours:`,

  CANCELLED: `❌ Action cancelled. Use /start to begin again.`,

  ERROR: `❌ Something went wrong. Please try again or use /cancel to start over.`,

  UNKNOWN_COMMAND: `I don't recognize that command. Use /help to see available commands.`,

  UNKNOWN_ACTION: `Unknown action`,

  BANNED: `🚫 Your account has been suspended. Contact support for assistance.`,

  ADMIN_ONLY: `⛔ This command is for admins only.`,
} as const

export function formatItemListItem(item: DbItem, index: number): string {
  const emoji = item.type === "lost" ? "🔴" : "🟢"
  const typeLabel = item.type === "lost" ? "LOST" : "FOUND"
  const date = new Date(item.happened_at).toLocaleDateString()

  return `${index}. ${emoji} <b>${typeLabel}</b>: ${item.title}
   📍 ${item.location_name} | 📅 ${date}`
}

export function formatItemDetail(item: DbItem): string {
  const emoji = item.type === "lost" ? "🔴" : "🟢"
  const typeLabel = item.type === "lost" ? "LOST" : "FOUND"
  const date = new Date(item.happened_at).toLocaleDateString()
  const createdDate = new Date(item.created_at).toLocaleDateString()

  return `${emoji} <b>${typeLabel}: ${item.title}</b>

<b>Category:</b> ${item.category}
<b>Location:</b> ${item.location_name}
<b>Date:</b> ${date}
<b>Posted:</b> ${createdDate}

<b>Description:</b>
${item.description || "No description provided."}

<b>Status:</b> ${item.state === "active" ? "🟢 Active" : item.state === "claimed" ? "✅ Claimed" : "⚪ " + item.state}`
}
