import { supabaseAdmin } from "@/lib/supabase/admin"
import type { TelegramUser, DbUser } from "./types"

export async function getOrCreateUser(telegramUser: TelegramUser): Promise<DbUser | null> {
  const telegramId = telegramUser.id

  try {
    // Try to find existing user
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("tg_user_id", telegramId)
      .single()

    if (findError && findError.code !== "PGRST116") {
      // PGRST116 = no rows returned (not an error for us)
      console.error("[v0] Error finding user:", findError)
    }

    const fullName = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ")

    if (existingUser) {
      // Update user info if changed
      if (existingUser.full_name !== fullName || existingUser.username !== telegramUser.username) {
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            username: telegramUser.username || null,
            full_name: fullName,
            updated_at: new Date().toISOString(),
          })
          .eq("tg_user_id", telegramId)
          .select()
          .single()

        if (updateError) {
          console.error("[v0] Error updating user:", updateError)
          return existingUser // Return existing user even if update fails
        }

        return updatedUser
      }
      return existingUser
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        tg_user_id: telegramId,
        username: telegramUser.username || null,
        full_name: fullName,
        is_banned: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Failed to create user:", insertError)
      return null
    }

    return newUser
  } catch (error) {
    console.error("[v0] Unexpected error in getOrCreateUser:", error)
    return null
  }
}

export async function isUserBanned(telegramId: number): Promise<boolean> {
  const { data } = await supabaseAdmin.from("users").select("is_banned").eq("tg_user_id", telegramId).single()

  return data?.is_banned ?? false
}

export async function isUserAdmin(telegramId: number): Promise<boolean> {
  // You can add specific admin usernames here
  const ADMIN_USERNAMES = ["your_admin_username"] // Add your Telegram username

  const { data } = await supabaseAdmin.from("users").select("username").eq("tg_user_id", telegramId).single()

  return ADMIN_USERNAMES.includes(data?.username || "")
}
