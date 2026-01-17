import { supabaseAdmin } from "@/lib/supabase/admin"

export interface ConversationData {
  step?: string
  itemType?: "lost" | "found"
  category?: string
  title?: string
  description?: string
  color?: string
  brand?: string
  location?: string
  locationDetail?: string
  dateOccurred?: string
  photos?: string[]
  searchQuery?: string
  searchCategory?: string
  selectedItemId?: string
  claimMessage?: string
  page?: number
}

export async function getConversationState(
  telegramId: string,
): Promise<{ state: string; data: ConversationData } | null> {
  const { data: user } = await supabaseAdmin.from("users").select("id").eq("telegram_id", telegramId).single()

  if (!user) return null

  const { data } = await supabaseAdmin.from("conversation_states").select("state, data").eq("user_id", user.id).single()

  return data as { state: string; data: ConversationData } | null
}

export async function setConversationState(
  telegramId: string,
  state: string,
  data: ConversationData = {},
): Promise<void> {
  const { data: user } = await supabaseAdmin.from("users").select("id").eq("telegram_id", telegramId).single()

  if (!user) return

  await supabaseAdmin.from("conversation_states").upsert(
    {
      user_id: user.id,
      state,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )
}

export async function clearConversationState(telegramId: string): Promise<void> {
  const { data: user } = await supabaseAdmin.from("users").select("id").eq("telegram_id", telegramId).single()

  if (!user) return

  await supabaseAdmin.from("conversation_states").delete().eq("user_id", user.id)
}

export async function updateConversationData(telegramId: string, updates: Partial<ConversationData>): Promise<void> {
  const current = await getConversationState(telegramId)
  if (!current) return

  await setConversationState(telegramId, current.state, {
    ...current.data,
    ...updates,
  })
}
