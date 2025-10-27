//CONTENEDOR DEL PANEL DEL PERSONAL DE LIMPIEZA //LOGO CERRAR CESIÓN

"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { Building2, LogOut, User } from "lucide-react"

export function StaffHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex justify-center mb-4">
              <img
                src="/ImagenUniversidadCatolicadePereira.png" 
                alt="Logo del Sistema"
                className="h-16 w-auto"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Sistema de Limpieza</h1>
              <p className="text-sm text-muted-foreground">Panel del Personal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.fullName}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
