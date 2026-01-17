import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendMessage, createInlineKeyboard } from "@/lib/telegram/api"
import { MESSAGES, formatItemListItem } from "@/lib/telegram/messages"

interface MatchableItem {
  id: string
  type: "lost" | "found"
  category: string
  title: string
  description: string | null
  location_name: string
  happened_at: string
  user_id: string
}

export async function findMatches(newItem: MatchableItem): Promise<{ item: MatchableItem; score: number }[]> {
  const oppositeType = newItem.type === "lost" ? "found" : "lost"

  const { data: candidates } = await supabaseAdmin
    .from("items")
    .select("id, type, category, title, description, location_name, happened_at, user_id")
    .eq("type", oppositeType)
    .eq("state", "active")
    .eq("category", newItem.category)
    .neq("user_id", newItem.user_id)
    .gte("happened_at", getDateRange(newItem.happened_at, -14))
    .lte("happened_at", getDateRange(newItem.happened_at, 14))

  if (!candidates || candidates.length === 0) {
    return []
  }

  const scoredMatches = candidates.map((candidate) => ({
    item: candidate as MatchableItem,
    score: calculateMatchScore(newItem, candidate as MatchableItem),
  }))

  return scoredMatches
    .filter((m) => m.score >= 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

function calculateMatchScore(item1: MatchableItem, item2: MatchableItem): number {
  let score = 0

  // Category match (required, already filtered)
  if (item1.category === item2.category) {
    score += 25
  }

  // Location match
  if (item1.location_name === item2.location_name) {
    score += 25
  }

  // Title similarity
  const titleSimilarity = calculateTextSimilarity(item1.title, item2.title)
  score += titleSimilarity * 30

  // Description similarity
  if (item1.description && item2.description) {
    const descSimilarity = calculateTextSimilarity(item1.description, item2.description)
    score += descSimilarity * 20
  }

  // Date proximity
  const daysDiff =
    Math.abs(new Date(item1.happened_at).getTime() - new Date(item2.happened_at).getTime()) / (1000 * 60 * 60 * 24)

  if (daysDiff <= 1) {
    score += 15
  } else if (daysDiff <= 3) {
    score += 10
  } else if (daysDiff <= 7) {
    score += 5
  }

  return Math.min(100, score)
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)
  const words2 = text2
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)

  if (words1.length === 0 || words2.length === 0) return 0

  const set1 = new Set(words1)
  const set2 = new Set(words2)

  const intersection = [...set1].filter((word) => set2.has(word))
  const union = new Set([...set1, ...set2])

  return intersection.length / union.size
}

function getDateRange(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export async function notifyPotentialMatches(itemId: string): Promise<void> {
  try {
    const { data: item } = await supabaseAdmin.from("items").select("*").eq("id", itemId).single()

    if (!item) return

    const matches = await findMatches(item as MatchableItem)

    if (matches.length === 0) {
      console.log("[v0] No matches found for item:", itemId)
      return
    }

    console.log("[v0] Found", matches.length, "potential matches for item:", itemId)

    // Store matches in database
    const matchInserts = matches.map((match) => ({
      source_item_id: item.id,
      candidate_item_id: match.item.id,
      score: match.score,
    }))

    await supabaseAdmin.from("matches").upsert(matchInserts, {
      onConflict: "source_item_id,candidate_item_id",
      ignoreDuplicates: true,
    })

    // Notify the item owner about potential matches
    const { data: owner } = await supabaseAdmin.from("users").select("tg_user_id").eq("id", item.user_id).single()

    if (owner) {
      let message = MESSAGES.MATCHES_FOUND + "\n\n"
      matches.forEach((match, index) => {
        message += formatItemListItem(match.item as any, index + 1) + `\n📊 Match score: ${match.score}%\n\n`
      })

      const buttons = matches.map((match) => [
        {
          text: `${match.item.type === "lost" ? "🔴" : "🟢"} ${match.item.title.substring(0, 20)} (${match.score}%)`,
          data: `view_${match.item.id}`,
        },
      ])

      await sendMessage(owner.tg_user_id, message, {
        parseMode: "HTML",
        replyMarkup: createInlineKeyboard(buttons),
      })
    }
  } catch (error) {
    console.error("[v0] Error in notifyPotentialMatches:", error)
  }
}
