import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface PendingClaimsProps {
  claims: Array<{
    id: string
    message: string | null
    created_at: string
    items: {
      title: string
      type: "lost" | "found"
    } | null
    users: {
      first_name: string
      username: string | null
    } | null
  }>
}

export function PendingClaims({ claims }: PendingClaimsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Pending Claims</CardTitle>
      </CardHeader>
      <CardContent>
        {claims.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending claims.</p>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim.id} className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{claim.items?.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {claim.items?.type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Claimed by {claim.users?.first_name || "Anonymous"}
                    </p>
                    {claim.message && (
                      <p className="mt-2 text-sm text-foreground/80 italic">
                        &quot;{claim.message.substring(0, 100)}
                        {claim.message.length > 100 ? "..." : ""}&quot;
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="h-8 w-8 bg-transparent">
                      <Check className="h-4 w-4 text-[var(--color-success)]" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 bg-transparent">
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
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
