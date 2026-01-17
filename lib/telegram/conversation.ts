import { supabaseAdmin } from "@/lib/supabase/admin"

export interface ConversationData {
  step?: string
  itemType?: "lost" | "found"
  category?: string
  title?: string
  description?: string
  location?: string
  locationDetail?: string
  dateOccurred?: string
  photos?: string[]
  searchQuery?: string
  searchCategory?: string
  selectedItemId?: string
  claimMessage?: string
  page?: number
  verificationQuestion?: string
}

export async function getConversationState(
  telegramId: number,
): Promise<{ state: string; data: ConversationData } | null> {
  const { data, error } = await supabaseAdmin
    .from("conversation_states")
    .select("state, data")
    .eq("tg_user_id", telegramId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error getting conversation state:", error)
  }

  return data as { state: string; data: ConversationData } | null
}

export async function setConversationState(
  telegramId: number,
  state: string,
  data: ConversationData = {},
): Promise<void> {
  const { error } = await supabaseAdmin.from("conversation_states").upsert(
    {
      tg_user_id: telegramId,
      state,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "tg_user_id" },
  )

  if (error) {
    console.error("[v0] Error setting conversation state:", error)
  }
}

export async function clearConversationState(telegramId: number): Promise<void> {
  const { error } = await supabaseAdmin.from("conversation_states").delete().eq("tg_user_id", telegramId)

  if (error) {
    console.error("[v0] Error clearing conversation state:", error)
  }
}

export async function updateConversationData(telegramId: number, updates: Partial<ConversationData>): Promise<void> {
  const current = await getConversationState(telegramId)
  if (!current) return

  await setConversationState(telegramId, current.state, {
    ...current.data,
    ...updates,
  })
}
