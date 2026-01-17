import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, ClipboardList, Search, CheckCircle } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalItems: number
    activeItems: number
    lostItems: number
    foundItems: number
    claimedItems: number
    totalUsers: number
    totalClaims: number
    pendingClaims: number
    totalMatches: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Active Items",
      value: stats.activeItems,
      subtitle: `${stats.lostItems} lost, ${stats.foundItems} found`,
      icon: Package,
      iconColor: "text-primary",
    },
    {
      title: "Items Claimed",
      value: stats.claimedItems,
      subtitle: "Successfully reunited",
      icon: CheckCircle,
      iconColor: "text-[var(--color-success)]",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      subtitle: "Registered users",
      icon: Users,
      iconColor: "text-[var(--color-info)]",
    },
    {
      title: "Pending Claims",
      value: stats.pendingClaims,
      subtitle: `${stats.totalClaims} total claims`,
      icon: ClipboardList,
      iconColor: "text-[var(--color-warning)]",
    },
    {
      title: "Potential Matches",
      value: stats.totalMatches,
      subtitle: "Automated matches found",
      icon: Search,
      iconColor: "text-primary",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
