"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Mock data - in production, this would come from the database
const data = [
  { date: "Mon", lost: 4, found: 3 },
  { date: "Tue", lost: 6, found: 5 },
  { date: "Wed", lost: 3, found: 7 },
  { date: "Thu", lost: 8, found: 4 },
  { date: "Fri", lost: 5, found: 6 },
  { date: "Sat", lost: 2, found: 3 },
  { date: "Sun", lost: 1, found: 2 },
]

export function ActivityChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141414",
                border: "1px solid #262626",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fafafa" }}
            />
            <Area
              type="monotone"
              dataKey="lost"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorLost)"
              name="Lost Items"
            />
            <Area
              type="monotone"
              dataKey="found"
              stroke="#22c55e"
              fillOpacity={1}
              fill="url(#colorFound)"
              name="Found Items"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Lost Items</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[var(--color-success)]" />
            <span className="text-muted-foreground">Found Items</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
