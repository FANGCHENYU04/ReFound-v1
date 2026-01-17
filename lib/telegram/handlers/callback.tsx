import type { TelegramCallbackQuery, DbItem } from "@/lib/telegram/types"
import { sendMessage, answerCallbackQuery, editMessageText, createInlineKeyboard } from "@/lib/telegram/api"
import { setConversationState } from "@/lib/telegram/conversation"
import { MESSAGES, formatItemListItem, formatItemDetail } from "@/lib/telegram/messages"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getOrCreateUser } from "@/lib/telegram/user"

export async function handleCallbackQuery(query: TelegramCallbackQuery): Promise<void> {
  const chatId = query.message?.chat.id
  const messageId = query.message?.message_id
  const data = query.data || ""
  const telegramId = query.from.id

  if (!chatId || !messageId) {
    await answerCallbackQuery(query.id, "Invalid callback")
    return
  }

  try {
    // Get or create user
    const user = await getOrCreateUser(query.from)
    if (!user) {
      await answerCallbackQuery(query.id, "Error: User not found")
      return
    }

    // Category selection: cat_Electronics
    if (data.startsWith("cat_")) {
      const category = data.replace("cat_", "")
      await handleCategorySelect(chatId, messageId, telegramId, category)
      await answerCallbackQuery(query.id)
      return
    }

    // Location selection: loc_Library
    if (data.startsWith("loc_")) {
      const location = data.replace("loc_", "")
      await handleLocationSelect(chatId, messageId, telegramId, location)
      await answerCallbackQuery(query.id)
      return
    }

    // Browse actions: browse_lost, browse_found, browse_all
    if (data.startsWith("browse_")) {
      const filter = data.replace("browse_", "")
      await handleBrowseItems(chatId, messageId, filter)
      await answerCallbackQuery(query.id)
      return
    }

    // View item: view_uuid
    if (data.startsWith("view_")) {
      const itemId = data.replace("view_", "")
      await handleViewItem(chatId, messageId, itemId, user.id)
      await answerCallbackQuery(query.id)
      return
    }

    // Claim item: claim_uuid
    if (data.startsWith("claim_")) {
      const itemId = data.replace("claim_", "")
      await handleStartClaim(chatId, telegramId, itemId)
      await answerCallbackQuery(query.id)
      return
    }

    // My item actions: myitem_uuid
    if (data.startsWith("myitem_")) {
      const itemId = data.replace("myitem_", "")
      await handleMyItemView(chatId, messageId, itemId)
      await answerCallbackQuery(query.id)
      return
    }

    // Delete item: delete_uuid
    if (data.startsWith("delete_")) {
      const itemId = data.replace("delete_", "")
      await handleDeleteItem(chatId, messageId, itemId, user.id)
      await answerCallbackQuery(query.id, "Item deleted")
      return
    }

    // Pagination: page_lost_1, page_found_2
    if (data.startsWith("page_")) {
      const [, filter, pageStr] = data.split("_")
      const page = Number.parseInt(pageStr, 10)
      await handleBrowseItems(chatId, messageId, filter, page)
      await answerCallbackQuery(query.id)
      return
    }

    await answerCallbackQuery(query.id, "Unknown action")
  } catch (error) {
    console.error("[v0] Error in handleCallbackQuery:", error)
    await answerCallbackQuery(query.id, "Something went wrong")
  }
}

async function handleCategorySelect(
  chatId: number,
  messageId: number,
  telegramId: number,
  category: string,
): Promise<void> {
  await setConversationState(telegramId, "report_title", { category })
  await editMessageText(chatId, messageId, `Category: <b>${category}</b>\n\n${MESSAGES.ASK_TITLE}`, {
    parseMode: "HTML",
  })
}

async function handleLocationSelect(
  chatId: number,
  messageId: number,
  telegramId: number,
  location: string,
): Promise<void> {
  await setConversationState(telegramId, "report_location_detail", { location })
  await editMessageText(chatId, messageId, `Location: <b>${location}</b>\n\n${MESSAGES.ASK_LOCATION_DETAIL}`, {
    parseMode: "HTML",
  })
}

async function handleBrowseItems(chatId: number, messageId: number, filter: string, page = 0): Promise<void> {
  const pageSize = 5
  const offset = page * pageSize

  let query = supabaseAdmin
    .from("items")
    .select("*", { count: "exact" })
    .eq("state", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (filter === "lost") {
    query = query.eq("type", "lost")
  } else if (filter === "found") {
    query = query.eq("type", "found")
  }

  const { data: items, count, error } = await query

  if (error || !items || items.length === 0) {
    await editMessageText(chatId, messageId, MESSAGES.NO_ITEMS, { parseMode: "HTML" })
    return
  }

  let message = `<b>${filter === "all" ? "All Items" : filter === "lost" ? "Lost Items" : "Found Items"}</b>\n\n`
  items.forEach((item, index) => {
    message += formatItemListItem(item as DbItem, offset + index + 1) + "\n\n"
  })

  const buttons: { text: string; data: string }[][] = items.map((item) => [
    {
      text: `${item.type === "lost" ? "🔴" : "🟢"} ${item.title.substring(0, 25)}`,
      data: `view_${item.id}`,
    },
  ])

  // Pagination
  const totalPages = Math.ceil((count || 0) / pageSize)
  if (totalPages > 1) {
    const navButtons: { text: string; data: string }[] = []
    if (page > 0) {
      navButtons.push({ text: "◀️ Previous", data: `page_${filter}_${page - 1}` })
    }
    if (page < totalPages - 1) {
      navButtons.push({ text: "Next ▶️", data: `page_${filter}_${page + 1}` })
    }
    if (navButtons.length > 0) {
      buttons.push(navButtons)
    }
  }

  await editMessageText(chatId, messageId, message, {
    parseMode: "HTML",
    replyMarkup: createInlineKeyboard(buttons),
  })
}

async function handleViewItem(chatId: number, messageId: number, itemId: string, userId: string): Promise<void> {
  const { data: item, error } = await supabaseAdmin.from("items").select("*").eq("id", itemId).single()

  if (error || !item) {
    await editMessageText(chatId, messageId, "Item not found or has been removed.", { parseMode: "HTML" })
    return
  }

  const message = formatItemDetail(item as DbItem)
  const buttons: { text: string; data: string }[][] = []

  // Only show claim button if not own item
  if (item.user_id !== userId) {
    buttons.push([{ text: "📋 Claim This Item", data: `claim_${item.id}` }])
  }

  buttons.push([{ text: "◀️ Back to Browse", data: "browse_all" }])

  await editMessageText(chatId, messageId, message, {
    parseMode: "HTML",
    replyMarkup: createInlineKeyboard(buttons),
  })
}

async function handleStartClaim(chatId: number, telegramId: number, itemId: string): Promise<void> {
  await setConversationState(telegramId, "claim_message", { selectedItemId: itemId })
  await sendMessage(chatId, MESSAGES.ASK_CLAIM_MESSAGE, { parseMode: "HTML" })
}

async function handleMyItemView(chatId: number, messageId: number, itemId: string): Promise<void> {
  const { data: item, error } = await supabaseAdmin.from("items").select("*").eq("id", itemId).single()

  if (error || !item) {
    await editMessageText(chatId, messageId, "Item not found.", { parseMode: "HTML" })
    return
  }

  const message = formatItemDetail(item as DbItem)
  const buttons: { text: string; data: string }[][] = [[{ text: "🗑️ Delete Item", data: `delete_${item.id}` }]]

  await editMessageText(chatId, messageId, message, {
    parseMode: "HTML",
    replyMarkup: createInlineKeyboard(buttons),
  })
}

async function handleDeleteItem(chatId: number, messageId: number, itemId: string, userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("items")
    .update({ state: "deleted" })
    .eq("id", itemId)
    .eq("user_id", userId)

  if (error) {
    await editMessageText(chatId, messageId, "Failed to delete item.", { parseMode: "HTML" })
    return
  }

  await editMessageText(chatId, messageId, "Item has been deleted.", { parseMode: "HTML" })
}
