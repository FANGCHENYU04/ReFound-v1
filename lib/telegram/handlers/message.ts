import type { TelegramMessage } from "@/lib/telegram/types"
import { sendMessage } from "@/lib/telegram/api"
import { getOrCreateUser, isUserBanned } from "@/lib/telegram/user"
import { getConversationState, clearConversationState } from "@/lib/telegram/conversation"
import { MESSAGES } from "@/lib/telegram/messages"
import { handleCommand } from "./commands"
import { handleConversationInput } from "./conversation-flow"

export async function handleMessage(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id
  const user = message.from

  if (!user || message.chat.type !== "private") {
    return
  }

  // Get or create user in database
  const dbUser = await getOrCreateUser(user)
  if (!dbUser) {
    await sendMessage(chatId, MESSAGES.ERROR)
    return
  }

  // Check if user is banned
  if (await isUserBanned(user.id.toString())) {
    await sendMessage(chatId, MESSAGES.BANNED)
    return
  }

  const text = message.text?.trim() || ""

  // Handle commands
  if (text.startsWith("/")) {
    const command = text.split(" ")[0].toLowerCase()

    // Cancel always works
    if (command === "/cancel") {
      await clearConversationState(user.id.toString())
      await sendMessage(chatId, MESSAGES.CANCELLED)
      return
    }

    // Check if user is in a conversation
    const convState = await getConversationState(user.id.toString())
    if (convState && convState.state !== "idle") {
      // Allow certain commands during conversation
      if (["/skip", "/done"].includes(command)) {
        await handleConversationInput(message, dbUser, convState)
        return
      }

      // Other commands cancel the conversation
      await clearConversationState(user.id.toString())
    }

    await handleCommand(command, message, dbUser)
    return
  }

  // Handle conversation flow
  const convState = await getConversationState(user.id.toString())
  if (convState && convState.state !== "idle") {
    await handleConversationInput(message, dbUser, convState)
    return
  }

  // No active conversation, show help
  await sendMessage(chatId, MESSAGES.HELP)
}
