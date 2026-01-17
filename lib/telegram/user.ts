import { supabaseAdmin } from "@/lib/supabase/admin"
import type { TelegramUser, DbUser } from "./types"

export async function getOrCreateUser(telegramUser: TelegramUser): Promise<DbUser | null> {
  const telegramId = telegramUser.id.toString()

  // Try to find existing user
  const { data: existingUser } = await supabaseAdmin.from("users").select("*").eq("telegram_id", telegramId).single()

  if (existingUser) {
    // Update user info if changed
    if (
      existingUser.username !== telegramUser.username ||
      existingUser.first_name !== telegramUser.first_name ||
      existingUser.last_name !== telegramUser.last_name
    ) {
      const { data: updatedUser } = await supabaseAdmin
        .from("users")
        .update({
          username: telegramUser.username || null,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name || null,
          updated_at: new Date().toISOString(),
        })
        .eq("telegram_id", telegramId)
        .select()
        .single()

      return updatedUser
    }
    return existingUser
  }

  // Create new user
  const { data: newUser, error } = await supabaseAdmin
    .from("users")
    .insert({
      telegram_id: telegramId,
      username: telegramUser.username || null,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name || null,
      role: "student",
      is_banned: false,
    })
    .select()
    .single()

  if (error) {
    console.error("Failed to create user:", error)
    return null
  }

  return newUser
}

export async function isUserBanned(telegramId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from("users").select("is_banned").eq("telegram_id", telegramId).single()

  return data?.is_banned ?? false
}

export async function isUserAdmin(telegramId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from("users").select("role").eq("telegram_id", telegramId).single()

  return data?.role === "admin"
}
