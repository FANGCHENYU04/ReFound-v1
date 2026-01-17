import { answerCallbackQuery, sendMessage } from "@/lib/telegram/api"
import { setConversationState, getConversationState } from "@/lib/telegram/conversation"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { MESSAGES, formatItemDetail, formatItemListItem, ITEM_CATEGORIES, type DbItem } from "@/lib/telegram/types"

export async function handleCallbackQuery(callbackQuery: {
  id: string
  from: { id: number; first_name: string; last_name?: string; username?: string }
  message?: { chat: { id: number }; message_id: number }
  data?: string
}) {
  const chatId = callbackQuery.message?.chat.id
  const userId = callbackQuery.from.id
  const data = callbackQuery.data || ""

  if (!chatId) {
    await answerCallbackQuery(callbackQuery.id, "Error: No chat ID")
    return
  }

  console.log("[v0] Callback received:", data, "from user:", userId)

  try {
    // Handle category selection: cat_Electronics or cat_Electronics_lost
    if (data.startsWith("cat_")) {
      const parts = data.replace("cat_", "").split("_")
      const category = parts[0]
      const itemType = parts[1] || "lost" // default to lost if not specified

      console.log("[v0] Category selected:", category, "type:", itemType)

      await setConversationState(userId, "awaiting_title", {
        type: itemType,
        category,
      })

      await answerCallbackQuery(callbackQuery.id)
      await sendMessage(chatId, MESSAGES.ASK_TITLE, { parseMode: "HTML" })
      return
    }

    // Handle location selection: loc_Central Library
    if (data.startsWith("loc_")) {
      const location = data.replace("loc_", "")
      const state = await getConversationState(userId)

      console.log("[v0] Location selected:", location)

      await setConversationState(userId, "awaiting_date", {
        ...state?.data,
        location_name: location,
      })

      await answerCallbackQuery(callbackQuery.id)
      await sendMessage(chatId, MESSAGES.ASK_DATE, {
        parseMode: "HTML",
        replyMarkup: {
          inline_keyboard: [[{ text: "📅 Today", callback_data: "date_today" }]],
        },
      })
      return
    }

    // Handle date selection
    if (data === "date_today") {
      const state = await getConversationState(userId)
      const today = new Date().toISOString().split("T")[0]

      console.log("[v0] Date today selected")

      await setConversationState(userId, "awaiting_photos", {
        ...state?.data,
        happened_at: today,
      })

      await answerCallbackQuery(callbackQuery.id)
      await sendMessage(chatId, MESSAGES.ASK_PHOTOS, { parseMode: "HTML" })
      return
    }

    // Handle start_lost button from main menu
    if (data === "start_lost") {
      console.log("[v0] Start lost flow")
      await startReportFlow(chatId, userId, "lost", callbackQuery.id)
      return
    }

    // Handle start_found button from main menu
    if (data === "start_found") {
      console.log("[v0] Start found flow")
      await startReportFlow(chatId, userId, "found", callbackQuery.id)
      return
    }

    // Handle browse buttons
    if (data === "start_browse" || data === "browse_all") {
      console.log("[v0] Browse all items")
      await handleBrowse(chatId, callbackQuery.id)
      return
    }

    if (data === "browse_lost") {
      console.log("[v0] Browse lost items")
      await handleBrowse(chatId, callbackQuery.id, "lost")
      return
    }

    if (data === "browse_found") {
      console.log("[v0] Browse found items")
      await handleBrowse(chatId, callbackQuery.id, "found")
      return
    }

    // Handle my items
    if (data === "start_my" || data === "my_items") {
      console.log("[v0] My items")
      await handleMyItems(chatId, userId, callbackQuery.id)
      return
    }

    // Handle view item: view_<id>
    if (data.startsWith("view_")) {
      const itemId = data.replace("view_", "")
      console.log("[v0] View item:", itemId)
      await handleViewItem(chatId, itemId, userId, callbackQuery.id)
      return
    }

    // Handle claim item: claim_<id>
    if (data.startsWith("claim_")) {
      const itemId = data.replace("claim_", "")
      console.log("[v0] Claim item:", itemId)
      await handleStartClaim(chatId, userId, itemId, callbackQuery.id)
      return
    }

    // Handle delete item: delete_<id>
    if (data.startsWith("delete_")) {
      const itemId = data.replace("delete_", "")
      console.log("[v0] Delete item:", itemId)
      await handleDeleteItem(chatId, userId, itemId, callbackQuery.id)
      return
    }

    // Handle pagination: page_<offset>
    if (data.startsWith("page_")) {
      const offset = Number.parseInt(data.replace("page_", ""))
      console.log("[v0] Page:", offset)
      await handleBrowse(chatId, callbackQuery.id, undefined, offset)
      return
    }

    // Unknown action
    console.log("[v0] Unknown callback action:", data)
    await answerCallbackQuery(callbackQuery.id, MESSAGES.UNKNOWN_ACTION)
  } catch (error) {
    console.error("[v0] Callback error:", error)
    await answerCallbackQuery(callbackQuery.id, "Error processing request")
    await sendMessage(chatId, MESSAGES.ERROR, { parseMode: "HTML" })
  }
}

async function startReportFlow(chatId: number, userId: number, type: "lost" | "found", callbackId: string) {
  await setConversationState(userId, "awaiting_category", { type })

  const categoryButtons = ITEM_CATEGORIES.map((cat) => [
    {
      text: cat,
      callback_data: `cat_${cat}_${type}`,
    },
  ])

  await answerCallbackQuery(callbackId)
  await sendMessage(chatId, type === "lost" ? MESSAGES.REPORT_START_LOST : MESSAGES.REPORT_START_FOUND, {
    parseMode: "HTML",
    replyMarkup: { inline_keyboard: categoryButtons },
  })
}

async function handleBrowse(chatId: number, callbackId: string, type?: "lost" | "found", offset = 0) {
  const limit = 5

  let query = supabaseAdmin
    .from("items")
    .select("*")
    .eq("state", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq("type", type)
  }

  const { data: items, error } = await query

  if (error) {
    console.error("[v0] Browse error:", error)
    await answerCallbackQuery(callbackId, "Error loading items")
    return
  }

  await answerCallbackQuery(callbackId)

  if (!items || items.length === 0) {
    await sendMessage(chatId, MESSAGES.NO_ITEMS, { parseMode: "HTML" })
    return
  }

  const itemsList = (items as DbItem[]).map((item, i) => formatItemListItem(item, offset + i + 1)).join("\n\n")

  const itemButtons = (items as DbItem[]).map((item) => [
    {
      text: `👁 ${item.title}`,
      callback_data: `view_${item.id}`,
    },
  ])

  // Add pagination
  const navButtons = []
  if (offset > 0) {
    navButtons.push({ text: "⬅️ Previous", callback_data: `page_${offset - limit}` })
  }
  if (items.length === limit) {
    navButtons.push({ text: "Next ➡️", callback_data: `page_${offset + limit}` })
  }
  if (navButtons.length > 0) {
    itemButtons.push(navButtons)
  }

  // Add filter buttons
  itemButtons.push([
    { text: "🔴 Lost Only", callback_data: "browse_lost" },
    { text: "🟢 Found Only", callback_data: "browse_found" },
  ])

  await sendMessage(chatId, `${MESSAGES.BROWSE_HEADER}\n\n${itemsList}`, {
    parseMode: "HTML",
    replyMarkup: { inline_keyboard: itemButtons },
  })
}

async function handleMyItems(chatId: number, userId: number, callbackId: string) {
  const { data: user } = await supabaseAdmin.from("users").select("id").eq("tg_user_id", userId).single()

  if (!user) {
    await answerCallbackQuery(callbackId)
    await sendMessage(chatId, MESSAGES.NO_MY_ITEMS, { parseMode: "HTML" })
    return
  }

  const { data: items, error } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("[v0] My items error:", error)
    await answerCallbackQuery(callbackId, "Error loading items")
    return
  }

  await answerCallbackQuery(callbackId)

  if (!items || items.length === 0) {
    await sendMessage(chatId, MESSAGES.NO_MY_ITEMS, { parseMode: "HTML" })
    return
  }

  const itemsList = (items as DbItem[]).map((item, i) => formatItemListItem(item, i + 1)).join("\n\n")

  const itemButtons = (items as DbItem[]).map((item) => [
    {
      text: `👁 ${item.title}`,
      callback_data: `view_${item.id}`,
    },
  ])

  await sendMessage(chatId, `${MESSAGES.MY_ITEMS_HEADER}\n\n${itemsList}`, {
    parseMode: "HTML",
    replyMarkup: { inline_keyboard: itemButtons },
  })
}

async function handleViewItem(chatId: number, itemId: string, userId: number, callbackId: string) {
  const { data: item, error } = await supabaseAdmin.from("items").select("*").eq("id", itemId).single()

  if (error || !item) {
    await answerCallbackQuery(callbackId, "Item not found")
    return
  }

  // Check if user owns this item
  const { data: user } = await supabaseAdmin.from("users").select("id").eq("tg_user_id", userId).single()

  const isOwner = user && item.user_id === user.id

  await answerCallbackQuery(callbackId)

  const buttons = []
  if (isOwner) {
    buttons.push([{ text: "🗑 Delete Item", callback_data: `delete_${itemId}` }])
  } else {
    buttons.push([{ text: "🙋 Claim This Item", callback_data: `claim_${itemId}` }])
  }
  buttons.push([{ text: "⬅️ Back to Browse", callback_data: "browse_all" }])

  await sendMessage(chatId, formatItemDetail(item as DbItem), {
    parseMode: "HTML",
    replyMarkup: { inline_keyboard: buttons },
  })
}

async function handleStartClaim(chatId: number, userId: number, itemId: string, callbackId: string) {
  await setConversationState(userId, "awaiting_claim_reason", { itemId })

  await answerCallbackQuery(callbackId)
  await sendMessage(chatId, MESSAGES.CLAIM_PROMPT, { parseMode: "HTML" })
}

async function handleDeleteItem(chatId: number, userId: number, itemId: string, callbackId: string) {
  // Verify ownership
  const { data: user } = await supabaseAdmin.from("users").select("id").eq("tg_user_id", userId).single()

  if (!user) {
    await answerCallbackQuery(callbackId, "User not found")
    return
  }

  const { data: item } = await supabaseAdmin.from("items").select("user_id").eq("id", itemId).single()

  if (!item || item.user_id !== user.id) {
    await answerCallbackQuery(callbackId, "You can only delete your own items")
    return
  }

  // Soft delete - set state to deleted
  await supabaseAdmin.from("items").update({ state: "deleted" }).eq("id", itemId)

  await answerCallbackQuery(callbackId, "Item deleted")
  await sendMessage(chatId, "✅ Item deleted successfully.", { parseMode: "HTML" })
}
