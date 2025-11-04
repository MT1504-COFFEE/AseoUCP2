//PANEL DEL ADMINISTRADOR 
"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { Building2, LogOut, Shield } from "lucide-react"

export function AdminHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex justify-center mb-4">
        <div className="aspect-square h-14">
          <img
            src="/ImagenUniversidadCatolicadePereira.png"
            alt="Logo del Sistema"
            className="object-contain w-full h-full"
          />
        </div>
      </div>
            <div>
              <h1 className="text-xl font-bold ">Sistema de Limpieza</h1>
              <p className="text-sm text-muted-foreground">Panel de Administración</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            <span className="font-medium truncate max-w-[120px] sm:max-w-none">
              {user?.fullName}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>

        </div>
      </div>
    </header>
  )
}
