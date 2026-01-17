import type { SendMessageOptions, InlineKeyboardMarkup } from "./types"

const TELEGRAM_API_BASE = "https://api.telegram.org/bot"

function getApiUrl(method: string): string {
  const token = process.env.TELEGRAM_BOT_TOKEN
  console.log(`[v0] Using token ending in: ...${token?.slice(-6) || "MISSING"}`)
  return `${TELEGRAM_API_BASE}${token}/${method}`
}

export async function sendMessage(
  chatId: number,
  text: string,
  options?: {
    parseMode?: "HTML" | "Markdown" | "MarkdownV2"
    replyMarkup?: InlineKeyboardMarkup
  },
): Promise<boolean> {
  try {
    const body: SendMessageOptions = {
      chat_id: chatId,
      text,
      parse_mode: options?.parseMode || "HTML",
    }

    if (options?.replyMarkup) {
      body.reply_markup = options.replyMarkup
    }

    const response = await fetch(getApiUrl("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const result = await response.json()
    return result.ok
  } catch (error) {
    console.error("Failed to send message:", error)
    return false
  }
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl("answerCallbackQuery"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    })

    const result = await response.json()
    return result.ok
  } catch (error) {
    console.error("Failed to answer callback query:", error)
    return false
  }
}

export async function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  options?: {
    parseMode?: "HTML" | "Markdown" | "MarkdownV2"
    replyMarkup?: InlineKeyboardMarkup
  },
): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl("editMessageText"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: options?.parseMode || "HTML",
        reply_markup: options?.replyMarkup,
      }),
    })

    const result = await response.json()
    return result.ok
  } catch (error) {
    console.error("Failed to edit message:", error)
    return false
  }
}

export async function getFile(fileId: string): Promise<string | null> {
  try {
    const response = await fetch(getApiUrl("getFile"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: fileId }),
    })

    const result = await response.json()
    if (result.ok && result.result.file_path) {
      return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${result.result.file_path}`
    }
    return null
  } catch (error) {
    console.error("Failed to get file:", error)
    return null
  }
}

export async function setWebhook(url: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(getApiUrl("setWebhook"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })

    const result = await response.json()
    console.log("[v0] setWebhook response:", JSON.stringify(result))

    if (result.ok) {
      return { success: true, message: "Webhook set successfully" }
    } else if (result.error_code === 429) {
      return {
        success: false,
        message: `Rate limited. Please wait ${result.parameters?.retry_after || 1} second(s) and try again.`,
      }
    } else {
      return { success: false, message: result.description || "Unknown error" }
    }
  } catch (error) {
    console.error("Failed to set webhook:", error)
    return { success: false, message: error instanceof Error ? error.message : "Network error" }
  }
}

export async function deleteWebhook(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(getApiUrl("deleteWebhook"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drop_pending_updates: false }),
    })

    const result = await response.json()
    console.log("[v0] deleteWebhook response:", JSON.stringify(result))

    if (result.ok) {
      return { success: true, message: "Webhook deleted successfully" }
    } else if (result.error_code === 429) {
      return { success: false, message: "Rate limited" }
    } else {
      return { success: false, message: result.description || "Unknown error" }
    }
  } catch (error) {
    console.error("Failed to delete webhook:", error)
    return { success: false, message: error instanceof Error ? error.message : "Network error" }
  }
}

export async function getWebhookInfo(): Promise<{ url: string; pending: number } | null> {
  try {
    const response = await fetch(getApiUrl("getWebhookInfo"), {
      method: "GET",
    })

    const result = await response.json()
    if (result.ok) {
      return {
        url: result.result.url || "",
        pending: result.result.pending_update_count || 0,
      }
    }
    return null
  } catch (error) {
    console.error("Failed to get webhook info:", error)
    return null
  }
}

// Helper to create inline keyboard
export function createInlineKeyboard(buttons: { text: string; data: string }[][]): InlineKeyboardMarkup {
  return {
    inline_keyboard: buttons.map((row) =>
      row.map((btn) => ({
        text: btn.text,
        callback_data: btn.data,
      })),
    ),
  }
}
