import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendMessage, answerCallbackQuery, createInlineKeyboard } from "../api"
import { setConversationState } from "../conversation"
import { MESSAGES, formatItemDetail, formatItemListItem } from "../messages"
import { ITEM_CATEGORIES } from "../types"
import type { DbItem } from "../types"

export async function handleCallbackQuery(callbackQuery: any) {
  const chatId = callbackQuery.message?.chat?.id
  const data = callbackQuery.data
  const telegramId = callbackQuery.from?.id

  if (!chatId || !data || !telegramId) {
    return
  }

  try {
    await answerCallbackQuery(callbackQuery.id)

    console.log("[v0] Callback data received:", data)

    if (data === "start_lost") {
      await startReportFlow(chatId, telegramId, "lost")
    } else if (data === "start_found") {
      await startReportFlow(chatId, telegramId, "found")
    } else if (data.startsWith("cat_")) {
      const category = data.replace("cat_", "")
      await handleCategorySelection(chatId, telegramId, category)
    } else if (data.startsWith("loc_")) {
      const location = data.replace("loc_", "")
      await handleLocationSelection(chatId, telegramId, location)
    } else if (data.startsWith("browse_")) {
      const browseType = data.replace("browse_", "")
      await handleBrowse(chatId, browseType, 0)
    } else if (data.startsWith("browse:")) {
      const [, category, pageStr] = data.split(":")
      await handleBrowse(chatId, category, Number.parseInt(pageStr || "0"))
    } else if (data.startsWith("view_") || data.startsWith("view:")) {
      const itemId = data.replace("view_", "").replace("view:", "")
      await handleViewItem(chatId, telegramId, itemId)
    } else if (data.startsWith("myitem_")) {
      const itemId = data.replace("myitem_", "")
      await handleViewItem(chatId, telegramId, itemId)
    } else if (data.startsWith("claim_") || data.startsWith("claim:")) {
      const itemId = data.replace("claim_", "").replace("claim:", "")
      await handleClaimStart(chatId, telegramId, itemId)
    } else if (data.startsWith("delete_") || data.startsWith("delete:")) {
      const itemId = data.replace("delete_", "").replace("delete:", "")
      await handleDeleteItem(chatId, telegramId, itemId)
    } else if (data === "menu" || data === "main_menu") {
      await handleMainMenu(chatId)
    } else if (data === "my" || data === "my_items") {
      await handleMyItems(chatId, telegramId)
    } else {
      console.log("[v0] Unknown callback action:", data)
      await sendMessage(chatId, "Unknown action: " + data)
    }
  } catch (error) {
    console.error("[v0] Callback error:", error)
    await sendMessage(chatId, MESSAGES.ERROR)
  }
}

async function startReportFlow(chatId: number, telegramId: number, type: "lost" | "found") {
  await setConversationState(telegramId, "report_category", { itemType: type })

  const categoryButtons = ITEM_CATEGORIES.map((cat) => [{ text: cat, data: `cat_${cat}` }])
  const keyboard = createInlineKeyboard(categoryButtons)

  const message = type === "lost" ? MESSAGES.REPORT_START_LOST : MESSAGES.REPORT_START_FOUND
  await sendMessage(chatId, message, { parseMode: "HTML", replyMarkup: keyboard })
}

async function handleCategorySelection(chatId: number, telegramId: number, category: string) {
  const { data: convState } = await supabaseAdmin
    .from("conversation_states")
    .select("data")
    .eq("tg_user_id", telegramId)
    .single()

  const itemType = convState?.data?.itemType || "lost"

  console.log("[v0] Category selected:", category, "for itemType:", itemType)

  await setConversationState(telegramId, "report_title", {
    category,
    itemType,
  })

  await sendMessage(chatId, MESSAGES.ASK_TITLE, { parseMode: "HTML" })
}

async function handleLocationSelection(chatId: number, telegramId: number, location: string) {
  const { data: convState } = await supabaseAdmin
    .from("conversation_states")
    .select("state, data")
    .eq("tg_user_id", telegramId)
    .single()

  if (!convState) {
    await sendMessage(chatId, MESSAGES.ERROR)
    return
  }

  const itemData = convState.data || {}

  console.log("[v0] Location selected:", location)

  await setConversationState(telegramId, "report_date", {
    ...itemData,
    location,
  })

  await sendMessage(chatId, MESSAGES.ASK_DATE, { parseMode: "HTML" })
}

async function handleBrowse(chatId: number, category: string, page = 0) {
  const pageSize = 5

  let query = supabaseAdmin
    .from("items")
    .select("*")
    .eq("state", "active")
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (category !== "all") {
    query = query.eq("type", category)
  }

  const { data: items, error } = await query

  if (error || !items || items.length === 0) {
    await sendMessage(chatId, MESSAGES.BROWSE_EMPTY)
    return
  }

  let text = `📋 <b>${category === "all" ? "All Items" : category.charAt(0).toUpperCase() + category.slice(1) + " Items"}</b>\n\n`
  items.forEach((item: DbItem, i: number) => {
    text += formatItemListItem(item, i + 1 + page * pageSize) + "\n\n"
  })

  const buttons: { text: string; data: string }[][] = items.map((item: DbItem) => [
    { text: `View: ${item.title.substring(0, 20)}`, data: `view_${item.id}` },
  ])

  const navButtons: { text: string; data: string }[] = []
  if (page > 0) {
    navButtons.push({ text: "⬅️ Prev", data: `browse:${category}:${page - 1}` })
  }
  if (items.length === pageSize) {
    navButtons.push({ text: "Next ➡️", data: `browse:${category}:${page + 1}` })
  }
  if (navButtons.length > 0) {
    buttons.push(navButtons)
  }
  buttons.push([{ text: "🏠 Main Menu", data: "menu" }])

  await sendMessage(chatId, text, { parseMode: "HTML", replyMarkup: createInlineKeyboard(buttons) })
}

async function handleViewItem(chatId: number, telegramId: number, itemId: string) {
  const { data: item, error } = await supabaseAdmin.from("items").select("*").eq("id", itemId).single()

  if (error || !item) {
    await sendMessage(chatId, "Item not found.")
    return
  }

  const text = formatItemDetail(item)
  const buttons: { text: string; data: string }[][] = []

  const { data: user } = await supabaseAdmin.from("users").select("id").eq("tg_user_id", telegramId).single()

  if (user && item.user_id === user.id) {
    buttons.push([{ text: "🗑️ Delete Item", data: `delete_${itemId}` }])
  } else {
    buttons.push([{ text: "🙋 Claim This Item", data: `claim_${itemId}` }])
  }
  buttons.push([{ text: "⬅️ Back", data: "browse_all" }])

  await sendMessage(chatId, text, { parseMode: "HTML", replyMarkup: createInlineKeyboard(buttons) })
}

async function handleClaimStart(chatId: number, telegramId: number, itemId: string) {
  await setConversationState(telegramId, "claim_message", { selectedItemId: itemId })
  await sendMessage(chatId, MESSAGES.CLAIM_ASK_PROOF, { parseMode: "HTML" })
}

async function handleDeleteItem(chatId: number, telegramId: number, itemId: string) {
  const { data: user } = await supabaseAdmin.from("users").select("id").eq("tg_user_id", telegramId).single()

  if (!user) {
    await sendMessage(chatId, MESSAGES.ERROR)
    return
  }

  const { error } = await supabaseAdmin
    .from("items")
    .update({ state: "deleted" })
    .eq("id", itemId)
    .eq("user_id", user.id)

  if (error) {
    console.error("[v0] Delete error:", error)
    await sendMessage(chatId, MESSAGES.ERROR)
    return
  }

  await sendMessage(chatId, MESSAGES.ITEM_DELETED)
  await handleMainMenu(chatId)
}

async function handleMainMenu(chatId: number) {
  const buttons = [
    [
      { text: "📝 Report Lost Item", data: "start_lost" },
      { text: "📦 Report Found Item", data: "start_found" },
    ],
    [
      { text: "🔍 Browse Items", data: "browse_all" },
      { text: "📁 My Items", data: "my_items" },
    ],
  ]

  await sendMessage(chatId, MESSAGES.WELCOME, { parseMode: "HTML", replyMarkup: createInlineKeyboard(buttons) })
}

async function handleMyItems(chatId: number, telegramId: number) {
  const { data: user } = await supabaseAdmin.from("users").select("id").eq("tg_user_id", telegramId).single()

  if (!user) {
    await sendMessage(chatId, MESSAGES.NO_MY_ITEMS, { parseMode: "HTML" })
    return
  }

  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("user_id", user.id)
    .neq("state", "deleted")
    .order("created_at", { ascending: false })

  if (!items || items.length === 0) {
    await sendMessage(chatId, MESSAGES.NO_MY_ITEMS, { parseMode: "HTML" })
    return
  }

  let text = MESSAGES.MY_ITEMS_HEADER
  items.forEach((item: DbItem, i: number) => {
    text += formatItemListItem(item, i + 1) + "\n\n"
  })

  const buttons: { text: string; data: string }[][] = items.map((item: DbItem) => [
    { text: `${item.type === "lost" ? "🔴" : "🟢"} ${item.title.substring(0, 20)}`, data: `view_${item.id}` },
  ])
  buttons.push([{ text: "🏠 Main Menu", data: "menu" }])

  await sendMessage(chatId, text, { parseMode: "HTML", replyMarkup: createInlineKeyboard(buttons) })
}
