import { supabaseAdmin } from "@/lib/supabase/admin"

interface MatchableItem {
  id: string
  type: "lost" | "found"
  category: string
  title: string
  description: string | null
  location: string
  date_occurred: string
  user_id: string
}

export async function findMatches(newItem: MatchableItem): Promise<MatchableItem[]> {
  // Find items of opposite type (lost vs found) with similar attributes
  const oppositeType = newItem.type === "lost" ? "found" : "lost"

  const { data: candidates } = await supabaseAdmin
    .from("items")
    .select("id, type, category, title, description, location, date_occurred, user_id")
    .eq("type", oppositeType)
    .eq("status", "active")
    .eq("category", newItem.category)
    .neq("user_id", newItem.user_id)
    .gte("date_occurred", getDateRange(newItem.date_occurred, -7))
    .lte("date_occurred", getDateRange(newItem.date_occurred, 7))

  if (!candidates || candidates.length === 0) {
    return []
  }

  // Score and rank matches
  const scoredMatches = candidates.map((candidate) => ({
    item: candidate,
    score: calculateMatchScore(newItem, candidate),
  }))

  // Filter and sort by score
  return scoredMatches
    .filter((m) => m.score >= 30) // Minimum 30% match
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((m) => m.item)
}

function calculateMatchScore(item1: MatchableItem, item2: MatchableItem): number {
  let score = 0

  // Category match (already filtered, but add weight)
  if (item1.category === item2.category) {
    score += 25
  }

  // Location match
  if (item1.location === item2.location) {
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

  // Date proximity (closer dates = higher score)
  const daysDiff =
    Math.abs(new Date(item1.date_occurred).getTime() - new Date(item2.date_occurred).getTime()) / (1000 * 60 * 60 * 24)

  if (daysDiff <= 1) {
    score += 10
  } else if (daysDiff <= 3) {
    score += 5
  }

  return Math.min(100, score)
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)

  const set1 = new Set(words1)
  const set2 = new Set(words2)

  const intersection = [...set1].filter((word) => set2.has(word))
  const union = new Set([...set1, ...set2])

  return intersection.length / union.size
}

function getDateRange(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

// Check for matches periodically and notify users
export async function notifyPotentialMatches(itemId: string): Promise<void> {
  const { data: item } = await supabaseAdmin.from("items").select("*, users(telegram_id)").eq("id", itemId).single()

  if (!item) return

  const matches = await findMatches(item)

  if (matches.length > 0) {
    // Store matches in database
    const matchInserts = matches.map((match) => ({
      lost_item_id: item.type === "lost" ? item.id : match.id,
      found_item_id: item.type === "found" ? item.id : match.id,
      score: 50, // Simplified score
      status: "pending",
    }))

    await supabaseAdmin.from("matches").upsert(matchInserts, {
      onConflict: "lost_item_id,found_item_id",
    })
  }
}
