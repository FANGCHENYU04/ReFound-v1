import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Package } from "lucide-react"

interface RecentItemsProps {
  items: Array<{
    id: string
    type: "lost" | "found"
    title: string
    category: string
    location: string
    status: string
    created_at: string
    users: {
      first_name: string
      username: string | null
    } | null
  }>
}

export function RecentItems({ items }: RecentItemsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Items</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No items reported yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      item.type === "lost" ? "bg-destructive/10" : "bg-[var(--color-success)]/10"
                    }`}
                  >
                    <Package
                      className={`h-5 w-5 ${item.type === "lost" ? "text-destructive" : "text-[var(--color-success)]"}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{item.title}</span>
                      <Badge variant={item.type === "lost" ? "destructive" : "default"} className="text-xs">
                        {item.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Posted by {item.users?.first_name || "Anonymous"}
                      {item.users?.username && ` (@${item.users.username})`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
