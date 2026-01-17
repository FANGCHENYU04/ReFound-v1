import { supabaseAdmin } from "@/lib/supabase/admin"
import { StatsCards } from "./stats-cards"
import { RecentItems } from "./recent-items"
import { PendingClaims } from "./pending-claims"
import { ActivityChart } from "./activity-chart"

async function getStats() {
  const [itemsResult, usersResult, claimsResult, matchesResult] = await Promise.all([
    supabaseAdmin.from("items").select("type, status", { count: "exact" }),
    supabaseAdmin.from("users").select("*", { count: "exact" }),
    supabaseAdmin.from("claims").select("status", { count: "exact" }),
    supabaseAdmin.from("matches").select("*", { count: "exact" }),
  ])

  const items = itemsResult.data || []
  const activeItems = items.filter((i) => i.status === "active").length
  const lostItems = items.filter((i) => i.type === "lost" && i.status === "active").length
  const foundItems = items.filter((i) => i.type === "found" && i.status === "active").length
  const claimedItems = items.filter((i) => i.status === "claimed").length

  const claims = claimsResult.data || []
  const pendingClaims = claims.filter((c) => c.status === "pending").length

  return {
    totalItems: itemsResult.count || 0,
    activeItems,
    lostItems,
    foundItems,
    claimedItems,
    totalUsers: usersResult.count || 0,
    totalClaims: claimsResult.count || 0,
    pendingClaims,
    totalMatches: matchesResult.count || 0,
  }
}

async function getRecentItems() {
  const { data } = await supabaseAdmin
    .from("items")
    .select("*, users(first_name, username)")
    .order("created_at", { ascending: false })
    .limit(5)

  return data || []
}

async function getPendingClaims() {
  const { data } = await supabaseAdmin
    .from("claims")
    .select("*, items(title, type), users:claimer_id(first_name, username)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5)

  return data || []
}

export async function AdminDashboard() {
  const [stats, recentItems, pendingClaims] = await Promise.all([getStats(), getRecentItems(), getPendingClaims()])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Campus Lost & Found Bot Overview</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityChart />
        <PendingClaims claims={pendingClaims} />
      </div>

      <RecentItems items={recentItems} />
    </div>
  )
}
