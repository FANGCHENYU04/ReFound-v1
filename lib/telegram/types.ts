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
  telegram_id: string
  username: string | null
  first_name: string
  last_name: string | null
  role: "student" | "admin"
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
  color: string | null
  brand: string | null
  location: string
  location_detail: string | null
  date_occurred: string
  status: "active" | "claimed" | "expired" | "deleted"
  created_at: string
  updated_at: string
}

export interface DbPhoto {
  id: string
  item_id: string
  file_id: string
  file_url: string | null
  created_at: string
}

export interface DbClaim {
  id: string
  item_id: string
  claimer_id: string
  message: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface ConversationState {
  id: string
  user_id: string
  state: string
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
