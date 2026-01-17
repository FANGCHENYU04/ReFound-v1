import type { TelegramMessage, DbUser } from "@/lib/telegram/types"
import { sendMessage, createInlineKeyboard } from "@/lib/telegram/api"
import {
  setConversationState,
  updateConversationData,
  clearConversationState,
  type ConversationData,
} from "@/lib/telegram/conversation"
import { MESSAGES } from "@/lib/telegram/messages"
import { CAMPUS_LOCATIONS } from "@/lib/telegram/types"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { notifyPotentialMatches } from "@/lib/telegram/matching"

export async function handleConversationInput(
  message: TelegramMessage,
  user: DbUser,
  convState: { state: string; data: ConversationData },
): Promise<void> {
  const chatId = message.chat.id
  const telegramId = message.from!.id.toString()
  const text = message.text?.trim() || ""
  const state = convState.state
  const data = convState.data

  switch (state) {
    case "report_title":
      await handleReportTitle(chatId, telegramId, text, data)
      break
    case "report_description":
      await handleReportDescription(chatId, telegramId, text, data)
      break
    case "report_location_detail":
      await handleReportLocationDetail(chatId, telegramId, text, data)
      break
    case "report_date":
      await handleReportDate(chatId, telegramId, text, data)
      break
    case "report_photos":
      await handleReportPhotos(chatId, telegramId, message, user, data)
      break
    case "search_query":
      await handleSearchQuery(chatId, telegramId, text)
      break
    case "claim_message":
      await handleClaimMessage(chatId, telegramId, text, user, data)
      break
    default:
      await sendMessage(chatId, MESSAGES.HELP, { parseMode: "HTML" })
  }
}

async function handleReportTitle(
  chatId: number,
  telegramId: string,
  text: string,
  data: ConversationData,
): Promise<void> {
  if (text.length < 3) {
    await sendMessage(chatId, "❌ Title is too short. Please provide a more descriptive title.")
    return
  }

  await updateConversationData(telegramId, { title: text })
  await setConversationState(telegramId, "report_description", { ...data, title: text })
  await sendMessage(chatId, MESSAGES.ASK_DESCRIPTION, { parseMode: "HTML" })
}

async function handleReportDescription(
  chatId: number,
  telegramId: string,
  text: string,
  data: ConversationData,
): Promise<void> {
  const description = text === "/skip" ? null : text
  await updateConversationData(telegramId, { description })
  await setConversationState(telegramId, "report_location", { ...data, description })

  const locationButtons = CAMPUS_LOCATIONS.map((loc) => [{ text: loc, data: `loc_${loc}` }])
  const keyboard = createInlineKeyboard(locationButtons)

  await sendMessage(chatId, MESSAGES.ASK_LOCATION, { parseMode: "HTML", replyMarkup: keyboard })
}

async function handleReportLocationDetail(
  chatId: number,
  telegramId: string,
  text: string,
  data: ConversationData,
): Promise<void> {
  const locationDetail = text === "/skip" ? null : text
  await updateConversationData(telegramId, { locationDetail })
  await setConversationState(telegramId, "report_date", { ...data, locationDetail })
  await sendMessage(chatId, MESSAGES.ASK_DATE, { parseMode: "HTML" })
}

async function handleReportDate(
  chatId: number,
  telegramId: string,
  text: string,
  data: ConversationData,
): Promise<void> {
  let dateOccurred: string

  if (text.toLowerCase() === "today") {
    dateOccurred = new Date().toISOString().split("T")[0]
  } else if (text.toLowerCase() === "yesterday") {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    dateOccurred = yesterday.toISOString().split("T")[0]
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    dateOccurred = text
  } else {
    await sendMessage(chatId, MESSAGES.INVALID_DATE, { parseMode: "HTML" })
    return
  }

  await updateConversationData(telegramId, { dateOccurred })
  await setConversationState(telegramId, "report_photos", { ...data, dateOccurred })
  await sendMessage(chatId, MESSAGES.ASK_PHOTOS, { parseMode: "HTML" })
}

async function handleReportPhotos(
  chatId: number,
  telegramId: string,
  message: TelegramMessage,
  user: DbUser,
  data: ConversationData,
): Promise<void> {
  const text = message.text?.trim().toLowerCase() || ""

  if (text === "/done" || text === "/skip") {
    await createItem(chatId, telegramId, user, data)
    return
  }

  if (message.photo && message.photo.length > 0) {
    const photos = data.photos || []
    const largestPhoto = message.photo[message.photo.length - 1]
    photos.push(largestPhoto.file_id)
    await updateConversationData(telegramId, { photos })
    await sendMessage(chatId, MESSAGES.PHOTO_RECEIVED, { parseMode: "HTML" })
  } else {
    await sendMessage(chatId, "📸 Please send a photo or type /done to finish.", { parseMode: "HTML" })
  }
}

async function createItem(chatId: number, telegramId: string, user: DbUser, data: ConversationData): Promise<void> {
  const { data: item, error } = await supabaseAdmin
    .from("items")
    .insert({
      user_id: user.id,
      type: data.itemType,
      category: data.category,
      title: data.title,
      description: data.description || null,
      color: data.color || null,
      brand: data.brand || null,
      location: data.location,
      location_detail: data.locationDetail || null,
      date_occurred: data.dateOccurred,
      status: "active",
    })
    .select()
    .single()

  if (error || !item) {
    console.error("Failed to create item:", error)
    await sendMessage(chatId, MESSAGES.ERROR, { parseMode: "HTML" })
    await clearConversationState(telegramId)
    return
  }

  if (data.photos && data.photos.length > 0) {
    const photoInserts = data.photos.map((fileId) => ({
      item_id: item.id,
      file_id: fileId,
    }))
    await supabaseAdmin.from("photos").insert(photoInserts)
  }

  await clearConversationState(telegramId)

  const successMessage = data.itemType === "lost" ? MESSAGES.ITEM_CREATED_LOST : MESSAGES.ITEM_CREATED_FOUND
  await sendMessage(chatId, successMessage, { parseMode: "HTML" })

  // Check for matches asynchronously
  notifyPotentialMatches(item.id).catch(console.error)
}

async function handleSearchQuery(chatId: number, telegramId: string, query: string): Promise<void> {
  if (query.length < 2) {
    await sendMessage(chatId, "❌ Search query is too short. Please enter at least 2 characters.")
    return
  }

  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("status", "active")
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(10)

  await clearConversationState(telegramId)

  if (!items || items.length === 0) {
    await sendMessage(chatId, MESSAGES.NO_SEARCH_RESULTS, { parseMode: "HTML" })
    return
  }

  let message = MESSAGES.SEARCH_RESULTS_HEADER
  const { formatItemListItem } = await import("@/lib/telegram/messages")

  items.forEach((item, index) => {
    message += formatItemListItem(item, index + 1) + "\n\n"
  })

  const buttons = items.map((item) => [
    {
      text: `${item.type === "lost" ? "🔴" : "🟢"} ${item.title.substring(0, 25)}`,
      data: `view_${item.id}`,
    },
  ])

  await sendMessage(chatId, message, {
    parseMode: "HTML",
    replyMarkup: createInlineKeyboard(buttons),
  })
}

async function handleClaimMessage(
  chatId: number,
  telegramId: string,
  text: string,
  user: DbUser,
  data: ConversationData,
): Promise<void> {
  if (!data.selectedItemId) {
    await sendMessage(chatId, MESSAGES.ERROR, { parseMode: "HTML" })
    await clearConversationState(telegramId)
    return
  }

  // Check if claim already exists
  const { data: existingClaim } = await supabaseAdmin
    .from("claims")
    .select("id")
    .eq("item_id", data.selectedItemId)
    .eq("claimer_id", user.id)
    .single()

  if (existingClaim) {
    await sendMessage(chatId, MESSAGES.CLAIM_ALREADY_EXISTS, { parseMode: "HTML" })
    await clearConversationState(telegramId)
    return
  }

  // Create claim
  const { error } = await supabaseAdmin.from("claims").insert({
    item_id: data.selectedItemId,
    claimer_id: user.id,
    message: text,
    status: "pending",
  })

  if (error) {
    console.error("Failed to create claim:", error)
    await sendMessage(chatId, MESSAGES.ERROR, { parseMode: "HTML" })
    await clearConversationState(telegramId)
    return
  }

  await clearConversationState(telegramId)
  await sendMessage(chatId, MESSAGES.CLAIM_SUBMITTED, { parseMode: "HTML" })
}
