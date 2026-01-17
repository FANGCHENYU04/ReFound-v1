"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Zap, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function ActivateButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleActivate() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/telegram/activate")
      const data = await res.json()
      setResult({
        success: data.success,
        message: data.message || data.error || "Unknown result",
      })
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to activate. Try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleActivate}
        disabled={loading}
        variant="outline"
        size="sm"
        className="border-green-500 text-green-500 hover:bg-green-500/10 bg-transparent"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
        {loading ? "Activating..." : "Activate Bot"}
      </Button>
      {result && (
        <span className={`text-xs flex items-center gap-1 ${result.success ? "text-green-500" : "text-red-500"}`}>
          {result.success ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {result.message}
        </span>
      )}
    </div>
  )
}

export function CheckStatusButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    isSet: boolean
    webhookUrl: string | null
    message: string
    lastError: string | null
  } | null>(null)

  async function handleCheck() {
    setLoading(true)
    try {
      const res = await fetch("/api/telegram/status")
      const data = await res.json()
      setStatus({
        isSet: data.isSet,
        webhookUrl: data.webhookUrl,
        message: data.message,
        lastError: data.lastError,
      })
    } catch (error) {
      setStatus({
        isSet: false,
        webhookUrl: null,
        message: "Failed to check status",
        lastError: null,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleCheck}
        disabled={loading}
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
        {loading ? "Checking..." : "Check Status"}
      </Button>
      {status && (
        <div
          className={`text-xs p-2 rounded ${status.isSet ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}
        >
          <p>{status.message}</p>
          {status.webhookUrl && <p className="truncate mt-1 opacity-70">URL: {status.webhookUrl}</p>}
          {status.lastError && <p className="mt-1 text-red-400">Error: {status.lastError}</p>}
        </div>
      )}
    </div>
  )
}
