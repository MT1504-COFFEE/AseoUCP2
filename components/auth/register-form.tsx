"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
// --- ELIMINAMOS 'Select' DE ESTA LÍNEA ---
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth/auth-provider"

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  // --- ELIMINAMOS EL ESTADO 'role' ---
  // const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { authenticate } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Attempting registration with:", { email, fullName })

      // --- CAMBIO EN LA LLAMADA A LA API ---
      // Ya no enviamos 'role', o lo enviamos forzado como 'cleaning_staff'
      // El backend (siguiente paso) lo forzará de todas formas.
      const data = await apiClient.register({ 
        email, 
        password, 
        fullName, 
        role: "cleaning_staff" // Enviamos esto por defecto
      })
      // -------------------------------------

      console.log("[v0] Registration successful, user data:", data.user)
      authenticate(data.user, data.token)

    } catch (err) {
      console.error("[v0] Registration error:", err)
      const apiError = err instanceof Error ? err.message : "Error al crear la cuenta";
      const errorDetailMatch = apiError.match(/\{"error":"(.*?)"\}/);
      setError(errorDetailMatch ? errorDetailMatch[1] : apiError);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/Catolica.jpg')] bg-cover bg-center bg-no-repeat bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex justify-center mb-4">
              <img
                src="/ImagenUniversidadCatolicadePereira.png" 
                alt="Logo del Sistema"
                className="h-16 w-auto"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-balance">Crear Cuenta</CardTitle>
          <CardDescription className="text-pretty">
            Completa los datos para crear tu cuenta en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ucp.edu.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* --- BLOQUE DE 'Rol' ELIMINADO --- */}
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}