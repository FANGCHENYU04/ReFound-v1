import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendMessage, answerCallbackQuery } from "../api"
import { setConversationState } from "../conversation"
import { MESSAGES, formatItemDetail, formatItemListItem } from "../messages"
import type { Item } from "../types"

export async function handleCallbackQuery(callbackQuery: any) {
  const chatId = callbackQuery.message?.chat?.id
  const messageId = callbackQuery.message?.message_id
  const data = callbackQuery.data
  const telegramId = callbackQuery.from?.id

  if (!chatId || !data || !telegramId) {
    return
  }

  try {
    await answerCallbackQuery(callbackQuery.id)

    const [action, ...params] = data.split(":")

    switch (action) {
      case "category":
        await handleCategorySelection(chatId, telegramId, params[0], params[1])
        break
      case "location":
        await handleLocationSelection(chatId, telegramId, params[0])
        break
      case "browse":
        await handleBrowse(chatId, params[0], Number.parseInt(params[1] || "0"))
        break
      case "view":
        await handleViewItem(chatId, telegramId, params[0])
        break
      case "claim":
        await handleClaimStart(chatId, telegramId, params[0])
        break
      case "delete":
        await handleDeleteItem(chatId, telegramId, params[0])
        break
      case "menu":
        await handleMainMenu(chatId)
        break
      case "my":
        await handleMyItems(chatId, telegramId)
        break
      default:
        await sendMessage(chatId, "Unknown action")
    }
  } catch (error) {
    console.error("[v0] Callback error:", error)
    await sendMessage(chatId, MESSAGES.ERROR)
  }
}

async function handleCategorySelection(chatId: number, telegramId: number, category: string, itemType: string) {
  await setConversationState(telegramId, "report_title", { category, itemType })
  await sendMessage(chatId, MESSAGES.ASK_TITLE)
}

async function handleLocationSelection(chatId: number, telegramId: number, location: string) {
  const { data: state } = await supabaseAdmin
    .from("conversation_states")
    .select("*")
    .eq("tg_user_id", telegramId)
    .single()

  if (!state) {
    await sendMessage(chatId, MESSAGES.ERROR)
    return
  }

  const itemData = state.data || {}
  itemData.location = location

  await setConversationState(telegramId, "report_date", itemData)
  await sendMessage(chatId, MESSAGES.ASK_DATE)
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
    query = query.eq("category", category)
  }

  const { data: items, error } = await query

  if (error || !items || items.length === 0) {
    await sendMessage(chatId, MESSAGES.BROWSE_EMPTY)
    return
  }

  let text = `📋 ${category === "all" ? "All Items" : category}\n\n`
  items.forEach((item: Item, i: number) => {
    text += formatItemListItem(item, i + page * pageSize) + "\n\n"
  })

  const buttons: any[][] = items.map((item: Item) => [
    { text: `View: ${item.title.substring(0, 20)}`, callback_data: `view:${item.id}` },
  ])

  const navButtons: any[] = []
  if (page > 0) {
    navButtons.push({ text: "⬅️ Prev", callback_data: `browse:${category}:${page - 1}` })
  }
  if (items.length === pageSize) {
    navButtons.push({ text: "Next ➡️", callback_data: `browse:${category}:${page + 1}` })
  }
  if (navButtons.length > 0) {
    buttons.push(navButtons)
  }
  buttons.push([{ text: "🏠 Main Menu", callback_data: "menu" }])

  await sendMessage(chatId, text, { parseMode: "HTML", replyMarkup: { inline_keyboard: buttons } })
}

async function handleViewItem(chatId: number, telegramId: number, itemId: string) {
  const { data: item, error } = await supabaseAdmin.from("items").select("*").eq("id", itemId).single()

  if (error || !item) {
    await sendMessage(chatId, "Item not found.")
    return
  }

  const text = formatItemDetail(item)
  const buttons: any[][] = []

  const { data: user } = await supabaseAdmin.from("users").select("id").eq("tg_user_id", telegramId).single()

  if (user && item.user_id === user.id) {
    buttons.push([{ text: "🗑️ Delete Item", callback_data: `delete:${itemId}` }])
  } else {
    buttons.push([{ text: "🙋 Claim This Item", callback_data: `claim:${itemId}` }])
  }
  buttons.push([{ text: "⬅️ Back", callback_data: "browse:all:0" }])

  await sendMessage(chatId, text, { parseMode: "HTML", replyMarkup: { inline_keyboard: buttons } })
}

async function handleClaimStart(chatId: number, telegramId: number, itemId: string) {
  await setConversationState(telegramId, "claim_message", { selectedItemId: itemId })
  await sendMessage(chatId, MESSAGES.CLAIM_ASK_PROOF)
}

async function handleDeleteItem(chatId: number, telegramId: number, itemId: string) {
  const { data: user } = await supabaseAdmin.from("users").select("id").eq("tg_user_id", telegramId).single()

  if (!user) {
    await sendMessage(chatId, MESSAGES.ERROR)
    return
  }

  const { error } = await supabaseAdmin.from("items").delete().eq("id", itemId).eq("user_id", user.id)

  if (error) {
    await sendMessage(chatId, MESSAGES.ERROR)
    return
  }

  await sendMessage(chatId, MESSAGES.ITEM_DELETED)
  await handleMainMenu(chatId)
}

async function handleMainMenu(chatId: number) {
  const buttons = [
    [
      { text: "📝 Report Lost Item", callback_data: "category:select:lost" },
      { text: "📦 Report Found Item", callback_data: "category:select:found" },
    ],
    [
      { text: "🔍 Browse Items", callback_data: "browse:all:0" },
      { text: "📁 My Items", callback_data: "my" },
    ],
  ]

  await sendMessage(chatId, MESSAGES.WELCOME, { parseMode: "HTML", replyMarkup: { inline_keyboard: buttons } })
}

async function handleMyItems(chatId: number, telegramId: number) {
  const { data: user } = await supabaseAdmin.from("users").select("id").eq("tg_user_id", telegramId).single()

  if (!user) {
    await sendMessage(chatId, MESSAGES.NO_MY_ITEMS)
    return
  }

  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (!items || items.length === 0) {
    await sendMessage(chatId, MESSAGES.NO_MY_ITEMS)
    return
  }

  let text = MESSAGES.MY_ITEMS_HEADER
  items.forEach((item: Item, i: number) => {
    text += formatItemListItem(item, i) + "\n\n"
  })

  const buttons: any[][] = items.map((item: Item) => [
    { text: `View: ${item.title.substring(0, 20)}`, callback_data: `view:${item.id}` },
  ])
  buttons.push([{ text: "🏠 Main Menu", callback_data: "menu" }])

  await sendMessage(chatId, text, { parseMode: "HTML", replyMarkup: { inline_keyboard: buttons } })
}
