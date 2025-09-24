"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { AdminHeader } from "@/components/admin/admin-header"
import { IncidentsDashboard } from "@/components/admin/incidents-dashboard"
import { CleaningHistory } from "@/components/admin/cleaning-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, History } from "lucide-react"

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && user.role === "cleaning_staff") {
      router.push("/staff")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-balance mb-2">Panel de Administración</h2>
            <p className="text-muted-foreground text-pretty">
              Supervisa las actividades de limpieza y gestiona los incidentes reportados
            </p>
          </div>

          <Tabs defaultValue="incidents" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="incidents" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Incidentes
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Historial de Limpieza
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incidents">
              <IncidentsDashboard />
            </TabsContent>

            <TabsContent value="history">
              <CleaningHistory />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
