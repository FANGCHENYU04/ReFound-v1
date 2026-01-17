import type { TelegramMessage, DbUser } from "@/lib/telegram/types"
import { sendMessage, createInlineKeyboard } from "@/lib/telegram/api"
import { setConversationState, clearConversationState } from "@/lib/telegram/conversation"
import { MESSAGES, formatItemListItem } from "@/lib/telegram/messages"
import { ITEM_CATEGORIES } from "@/lib/telegram/types"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { isUserAdmin } from "@/lib/telegram/user"

export async function handleCommand(command: string, message: TelegramMessage, user: DbUser): Promise<void> {
  const chatId = message.chat.id
  const telegramId = message.from!.id

  try {
    switch (command) {
      case "/start":
      case "/help":
        await handleStart(chatId)
        break

      case "/lost":
        await startReportFlow(chatId, telegramId, "lost")
        break

      case "/found":
        await startReportFlow(chatId, telegramId, "found")
        break

      case "/browse":
        await handleBrowse(chatId)
        break

      case "/search":
        await handleSearchStart(chatId, telegramId)
        break

      case "/my":
        await handleMyItems(chatId, user)
        break

      case "/cancel":
        await clearConversationState(telegramId)
        await sendMessage(chatId, MESSAGES.CANCELLED)
        break

      case "/admin":
        if (await isUserAdmin(telegramId)) {
          await sendMessage(chatId, "Admin panel coming soon. For now, use the web dashboard.")
        } else {
          await sendMessage(chatId, MESSAGES.ADMIN_ONLY)
        }
        break

      default:
        await sendMessage(chatId, MESSAGES.HELP, { parseMode: "HTML" })
    }
  } catch (error) {
    console.error("[v0] Error in handleCommand:", error)
    await sendMessage(chatId, MESSAGES.ERROR)
  }
}

async function handleStart(chatId: number): Promise<void> {
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

  await sendMessage(chatId, MESSAGES.WELCOME, {
    parseMode: "HTML",
    replyMarkup: createInlineKeyboard(buttons),
  })
}

async function startReportFlow(chatId: number, telegramId: number, type: "lost" | "found"): Promise<void> {
  await setConversationState(telegramId, "report_category", { itemType: type })

  const categoryButtons = ITEM_CATEGORIES.map((cat) => [{ text: cat, data: `cat_${cat}` }])
  const keyboard = createInlineKeyboard(categoryButtons)

  const message = type === "lost" ? MESSAGES.REPORT_START_LOST : MESSAGES.REPORT_START_FOUND
  await sendMessage(chatId, message, { parseMode: "HTML", replyMarkup: keyboard })
}

async function handleBrowse(chatId: number): Promise<void> {
  const keyboard = createInlineKeyboard([
    [
      { text: "🔴 Lost Items", data: "browse_lost" },
      { text: "🟢 Found Items", data: "browse_found" },
    ],
    [{ text: "📋 All Items", data: "browse_all" }],
  ])

  await sendMessage(chatId, MESSAGES.BROWSE_HEADER, { parseMode: "HTML", replyMarkup: keyboard })
}

async function handleSearchStart(chatId: number, telegramId: number): Promise<void> {
  await setConversationState(telegramId, "search_query", {})
  await sendMessage(chatId, MESSAGES.ASK_SEARCH_QUERY, { parseMode: "HTML" })
}

async function handleMyItems(chatId: number, user: DbUser): Promise<void> {
  const { data: items, error } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("user_id", user.id)
    .neq("state", "deleted")
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("[v0] Error fetching user items:", error)
    await sendMessage(chatId, MESSAGES.ERROR)
    return
  }

  if (!items || items.length === 0) {
    await sendMessage(chatId, MESSAGES.NO_MY_ITEMS, { parseMode: "HTML" })
    return
  }

  let message = MESSAGES.MY_ITEMS_HEADER
  items.forEach((item, index) => {
    message += formatItemListItem(item, index + 1) + "\n\n"
  })

  const buttons = items.map((item) => [
    {
      text: `${item.type === "lost" ? "🔴" : "🟢"} ${item.title.substring(0, 25)}`,
      data: `myitem_${item.id}`,
    },
  ])
  buttons.push([{ text: "🏠 Main Menu", data: "menu" }])

  await sendMessage(chatId, message, { parseMode: "HTML", replyMarkup: createInlineKeyboard(buttons) })
}
