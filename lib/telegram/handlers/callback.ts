import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendMessage, answerCallbackQuery, editMessageText } from "@/lib/telegram/api"
import { setConversationState } from "@/lib/telegram/conversation"
import { MESSAGES, CATEGORIES, LOCATIONS, formatItemListItem, formatItemDetail } from "@/lib/telegram/messages"
import type { TelegramCallbackQuery } from "@/lib/telegram/types"

export async function handleCallbackQuery(callback: TelegramCallbackQuery) {
  const chatId = callback.message?.chat.id
  const messageId = callback.message?.message_id
  const data = callback.data
  const userId = callback.from.id.toString()

  if (!chatId || !data) {
    return answerCallbackQuery(callback.id, "Invalid callback")
  }

  const [action, ...params] = data.split(":")

  try {
    switch (action) {
      case "category":
        await handleCategorySelection(chatId, userId, params[0], callback.id)
        break
      case "location":
        await handleLocationSelection(chatId, userId, params[0], callback.id)
        break
      case "browse":
        await handleBrowse(chatId, messageId!, params[0] || "all", Number.parseInt(params[1]) || 0, callback.id)
        break
      case "view":
        await handleViewItem(chatId, messageId!, params[0], callback.id)
        break
      case "claim":
        await handleStartClaim(chatId, userId, params[0], callback.id)
        break
      case "delete":
        await handleDeleteItem(chatId, userId, params[0], callback.id)
        break
      case "back":
        await handleBack(chatId, messageId!, params[0], callback.id)
        break
      default:
        await answerCallbackQuery(callback.id, "Unknown action")
    }
  } catch (error) {
    console.error("Callback error:", error)
    await answerCallbackQuery(callback.id, "An error occurred")
  }
}

async function handleCategorySelection(chatId: number, odId: string, category: string, callbackId: string) {
  await setConversationState(chatId, {
    step: "awaiting_title",
    data: { category },
  })
  await answerCallbackQuery(callbackId)
  await sendMessage(chatId, MESSAGES.ENTER_TITLE)
}

async function handleLocationSelection(chatId: number, odId: string, location: string, callbackId: string) {
  await setConversationState(chatId, {
    step: "awaiting_date",
    data: { location },
  })
  await answerCallbackQuery(callbackId)
  await sendMessage(chatId, MESSAGES.ENTER_DATE)
}

async function handleBrowse(chatId: number, messageId: number, filter: string, offset: number, callbackId: string) {
  const limit = 5
  let query = supabaseAdmin
    .from("items")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (filter === "lost" || filter === "found") {
    query = query.eq("type", filter)
  }

  const { data: items, error } = await query

  if (error || !items || items.length === 0) {
    await answerCallbackQuery(callbackId, "No more items")
    return
  }

  let message = `📋 Items (${filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}):\n\n`
  items.forEach((item) => {
    message += formatItemListItem(item) + "\n\n"
  })

  const keyboard: { text: string; callback_data: string }[][] = []

  // Item buttons
  items.forEach((item) => {
    keyboard.push([{ text: `View: ${item.title.slice(0, 20)}...`, callback_data: `view:${item.id}` }])
  })

  // Pagination
  const navRow: { text: string; callback_data: string }[] = []
  if (offset > 0) {
    navRow.push({ text: "⬅️ Previous", callback_data: `browse:${filter}:${offset - limit}` })
  }
  navRow.push({ text: "➡️ Next", callback_data: `browse:${filter}:${offset + limit}` })
  keyboard.push(navRow)

  // Filter buttons
  keyboard.push([
    { text: filter === "all" ? "✅ All" : "All", callback_data: `browse:all:0` },
    { text: filter === "lost" ? "✅ Lost" : "Lost", callback_data: `browse:lost:0` },
    { text: filter === "found" ? "✅ Found" : "Found", callback_data: `browse:found:0` },
  ])

  await answerCallbackQuery(callbackId)
  await editMessageText(chatId, messageId, message, { inline_keyboard: keyboard })
}

async function handleViewItem(chatId: number, messageId: number, itemId: string, callbackId: string) {
  const { data: item, error } = await supabaseAdmin.from("items").select("*").eq("id", itemId).single()

  if (error || !item) {
    await answerCallbackQuery(callbackId, "Item not found")
    return
  }

  const message = formatItemDetail(item)

  const keyboard: { text: string; callback_data: string }[][] = [
    [{ text: "🙋 Claim this item", callback_data: `claim:${item.id}` }],
    [{ text: "⬅️ Back to list", callback_data: `back:browse` }],
  ]

  await answerCallbackQuery(callbackId)
  await editMessageText(chatId, messageId, message, { inline_keyboard: keyboard })
}

async function handleStartClaim(chatId: number, odId: string, itemId: string, callbackId: string) {
  await setConversationState(chatId, {
    step: "awaiting_claim_reason",
    data: { itemId },
  })
  await answerCallbackQuery(callbackId)
  await sendMessage(chatId, MESSAGES.CLAIM_REASON)
}

async function handleDeleteItem(chatId: number, odId: string, itemId: string, callbackId: string) {
  const { error } = await supabaseAdmin.from("items").update({ status: "deleted" }).eq("id", itemId).eq("user_id", odId)

  if (error) {
    await answerCallbackQuery(callbackId, "Failed to delete")
    return
  }

  await answerCallbackQuery(callbackId, "Item deleted")
  await sendMessage(chatId, MESSAGES.ITEM_DELETED)
}

async function handleBack(chatId: number, messageId: number, destination: string, callbackId: string) {
  if (destination === "browse") {
    await handleBrowse(chatId, messageId, "all", 0, callbackId)
  }
}

export function getCategoryKeyboard() {
  const keyboard: { text: string; callback_data: string }[][] = []
  for (let i = 0; i < CATEGORIES.length; i += 2) {
    const row: { text: string; callback_data: string }[] = []
    row.push({
      text: `${CATEGORIES[i].emoji} ${CATEGORIES[i].label}`,
      callback_data: `category:${CATEGORIES[i].id}`,
    })
    if (CATEGORIES[i + 1]) {
      row.push({
        text: `${CATEGORIES[i + 1].emoji} ${CATEGORIES[i + 1].label}`,
        callback_data: `category:${CATEGORIES[i + 1].id}`,
      })
    }
    keyboard.push(row)
  }
  return { inline_keyboard: keyboard }
}

export function getLocationKeyboard() {
  const keyboard: { text: string; callback_data: string }[][] = []
  for (let i = 0; i < LOCATIONS.length; i += 2) {
    const row: { text: string; callback_data: string }[] = []
    row.push({
      text: LOCATIONS[i].label,
      callback_data: `location:${LOCATIONS[i].id}`,
    })
    if (LOCATIONS[i + 1]) {
      row.push({
        text: LOCATIONS[i + 1].label,
        callback_data: `location:${LOCATIONS[i + 1].id}`,
      })
    }
    keyboard.push(row)
  }
  return { inline_keyboard: keyboard }
}
