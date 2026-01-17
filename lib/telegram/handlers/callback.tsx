import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendMessage, answerCallbackQuery, editMessageText, createInlineKeyboard } from "@/lib/telegram/api"
import { setConversationState, clearConversationState } from "@/lib/telegram/conversation"
import { MESSAGES, formatItemListItem, formatItemDetail } from "@/lib/telegram/messages"
import type { TelegramCallbackQuery } from "@/lib/telegram/types"
import { getOrCreateUser } from "@/lib/telegram/user"

export async function handleCallbackQuery(callback: TelegramCallbackQuery) {
  const chatId = callback.message?.chat.id
  const messageId = callback.message?.message_id
  const data = callback.data
  const telegramId = callback.from.id

  if (!chatId || !data) {
    return answerCallbackQuery(callback.id, "Invalid callback")
  }

  try {
    // Handle category selection (cat_Electronics, etc.)
    if (data.startsWith("cat_")) {
      const category = data.replace("cat_", "")
      await handleCategorySelection(chatId, telegramId, category, callback.id)
      return
    }

    // Handle location selection (loc_Library, etc.)
    if (data.startsWith("loc_")) {
      const location = data.replace("loc_", "")
      await handleLocationSelection(chatId, telegramId, location, callback.id)
      return
    }

    // Handle browse actions
    if (data.startsWith("browse_")) {
      const filter = data.replace("browse_", "")
      await handleBrowse(chatId, messageId!, filter, 0, callback.id)
      return
    }

    // Handle view item
    if (data.startsWith("view_")) {
      const itemId = data.replace("view_", "")
      await handleViewItem(chatId, messageId!, itemId, callback.id)
      return
    }

    // Handle claim item
    if (data.startsWith("claim_")) {
      const itemId = data.replace("claim_", "")
      await handleStartClaim(chatId, telegramId, itemId, callback.id)
      return
    }

    // Handle my item view
    if (data.startsWith("myitem_")) {
      const itemId = data.replace("myitem_", "")
      await handleMyItemView(chatId, messageId!, itemId, telegramId, callback.id)
      return
    }

    // Handle delete
    if (data.startsWith("delete_")) {
      const itemId = data.replace("delete_", "")
      await handleDeleteItem(chatId, telegramId, itemId, callback.id)
      return
    }

    // Handle pagination
    if (data.startsWith("page_")) {
      const [, filter, pageStr] = data.split("_")
      await handleBrowse(chatId, messageId!, filter, Number.parseInt(pageStr), callback.id)
      return
    }

    await answerCallbackQuery(callback.id, "Unknown action")
  } catch (error) {
    console.error("[v0] Callback error:", error)
    await answerCallbackQuery(callback.id, "An error occurred")
  }
}

async function handleCategorySelection(
  chatId: number,
  telegramId: number,
  category: string,
  callbackId: string,
): Promise<void> {
  const current = await import("@/lib/telegram/conversation").then((m) => m.getConversationState(telegramId))
  const data = current?.data || {}

  await setConversationState(telegramId, "report_title", { ...data, category })
  await answerCallbackQuery(callbackId)
  await sendMessage(chatId, MESSAGES.ASK_TITLE, { parseMode: "HTML" })
}

async function handleLocationSelection(
  chatId: number,
  telegramId: number,
  location: string,
  callbackId: string,
): Promise<void> {
  const current = await import("@/lib/telegram/conversation").then((m) => m.getConversationState(telegramId))
  const data = current?.data || {}

  await setConversationState(telegramId, "report_date", { ...data, location })
  await answerCallbackQuery(callbackId)
  await sendMessage(chatId, MESSAGES.ASK_DATE, { parseMode: "HTML" })
}

async function handleBrowse(
  chatId: number,
  messageId: number,
  filter: string,
  offset: number,
  callbackId: string,
): Promise<void> {
  const limit = 5

  let query = supabaseAdmin
    .from("items")
    .select("*")
    .eq("state", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (filter === "lost" || filter === "found") {
    query = query.eq("type", filter)
  }

  const { data: items, error } = await query

  if (error) {
    console.error("[v0] Browse error:", error)
    await answerCallbackQuery(callbackId, "Error loading items")
    return
  }

  if (!items || items.length === 0) {
    await answerCallbackQuery(callbackId, "No more items")
    return
  }

  const filterLabel = filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)
  let message = `<b>Items (${filterLabel}):</b>\n\n`

  items.forEach((item, index) => {
    message += formatItemListItem(item, offset + index + 1) + "\n\n"
  })

  const buttons: { text: string; data: string }[][] = []

  // Item buttons
  items.forEach((item) => {
    buttons.push([
      {
        text: `${item.type === "lost" ? "🔴" : "🟢"} ${item.title.slice(0, 25)}`,
        data: `view_${item.id}`,
      },
    ])
  })

  // Pagination
  const navRow: { text: string; data: string }[] = []
  if (offset > 0) {
    navRow.push({ text: "Previous", data: `page_${filter}_${offset - limit}` })
  }
  if (items.length === limit) {
    navRow.push({ text: "Next", data: `page_${filter}_${offset + limit}` })
  }
  if (navRow.length > 0) {
    buttons.push(navRow)
  }

  // Filter buttons
  buttons.push([
    { text: filter === "all" ? "[All]" : "All", data: "browse_all" },
    { text: filter === "lost" ? "[Lost]" : "Lost", data: "browse_lost" },
    { text: filter === "found" ? "[Found]" : "Found", data: "browse_found" },
  ])

  await answerCallbackQuery(callbackId)
  await editMessageText(chatId, messageId, message, {
    parseMode: "HTML",
    replyMarkup: createInlineKeyboard(buttons),
  })
}

async function handleViewItem(chatId: number, messageId: number, itemId: string, callbackId: string): Promise<void> {
  const { data: item, error } = await supabaseAdmin.from("items").select("*").eq("id", itemId).single()

  if (error || !item) {
    await answerCallbackQuery(callbackId, "Item not found")
    return
  }

  const message = formatItemDetail(item)

  const buttons = [
    [{ text: "Claim this item", data: `claim_${item.id}` }],
    [{ text: "Back to list", data: "browse_all" }],
  ]

  await answerCallbackQuery(callbackId)
  await editMessageText(chatId, messageId, message, {
    parseMode: "HTML",
    replyMarkup: createInlineKeyboard(buttons),
  })
}

async function handleMyItemView(
  chatId: number,
  messageId: number,
  itemId: string,
  telegramId: number,
  callbackId: string,
): Promise<void> {
  const { data: item, error } = await supabaseAdmin.from("items").select("*").eq("id", itemId).single()

  if (error || !item) {
    await answerCallbackQuery(callbackId, "Item not found")
    return
  }

  const message = formatItemDetail(item)

  const buttons = [[{ text: "Delete Item", data: `delete_${item.id}` }]]

  await answerCallbackQuery(callbackId)
  await editMessageText(chatId, messageId, message, {
    parseMode: "HTML",
    replyMarkup: createInlineKeyboard(buttons),
  })
}

async function handleStartClaim(chatId: number, telegramId: number, itemId: string, callbackId: string): Promise<void> {
  await setConversationState(telegramId, "claim_message", { selectedItemId: itemId })
  await answerCallbackQuery(callbackId)
  await sendMessage(chatId, MESSAGES.CLAIM_START, { parseMode: "HTML" })
}

async function handleDeleteItem(chatId: number, telegramId: number, itemId: string, callbackId: string): Promise<void> {
  // Verify ownership
  const user = await getOrCreateUser({ id: telegramId, is_bot: false, first_name: "" })
  if (!user) {
    await answerCallbackQuery(callbackId, "Error")
    return
  }

  const { error } = await supabaseAdmin
    .from("items")
    .update({ state: "deleted" })
    .eq("id", itemId)
    .eq("user_id", user.id)

  if (error) {
    await answerCallbackQuery(callbackId, "Failed to delete")
    return
  }

  await answerCallbackQuery(callbackId, "Item deleted")
  await clearConversationState(telegramId)
  await sendMessage(chatId, MESSAGES.ITEM_DELETED)
}
