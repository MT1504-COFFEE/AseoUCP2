"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { StaffHeader } from "@/components/staff/staff-header"
import { CleaningForm } from "@/components/staff/cleaning-form"
import { IncidentForm } from "@/components/staff/incident-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertTriangle } from "lucide-react"

export default function StaffPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && user.role === "admin") {
      router.push("/admin")
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

  if (!user || user.role !== "cleaning_staff") {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <StaffHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-balance mb-2">Bienvenido, {user.fullName}</h2>
            <p className="text-muted-foreground text-pretty">
              Registra tus actividades de limpieza y reporta cualquier incidente que encuentres
            </p>
          </div>

          <Tabs defaultValue="cleaning" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cleaning" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Registrar Limpieza
              </TabsTrigger>
              <TabsTrigger value="incident" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Reportar Incidente
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cleaning">
              <CleaningForm />
            </TabsContent>

            <TabsContent value="incident">
              <IncidentForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
