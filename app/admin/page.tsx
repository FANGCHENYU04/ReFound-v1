import { Suspense } from "react"
import { AdminDashboard } from "@/components/admin/dashboard"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Spinner } from "@/components/ui/spinner"

export default function AdminPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <AdminDashboard />
        </Suspense>
      </main>
    </div>
  )
}
