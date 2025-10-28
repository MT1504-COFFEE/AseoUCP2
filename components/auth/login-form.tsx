// FORMULARIO LOGIN

"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider" // Importamos useAuth
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Building2, UserPlus } from "lucide-react"
import Link from "next/link"

export function LoginForm() {
  const { login } = useAuth() // Obtenemos la función login del contexto
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simplemente llamamos a la función centralizada de login
      await login(email, password)
      // La redirección ahora ocurre dentro de la función login del AuthProvider
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  // ... el resto del componente (el return con el JSX) se mantiene exactamente igual
  return (
     <div className="min-h-screen flex items-center justify-center bg-[url('/Catolica.jpg')] bg-cover bg-center bg-no-repeat bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/ImagenUniversidadCatolicadePereira.png" 
              alt="Logo del Sistema"
              className="h-16 w-auto"
            />
          </div>

          <CardTitle className="text-2xl font-bold text-balance">Sistema de Gestión de Limpieza</CardTitle>
          <CardDescription className="text-pretty">Ingresa tus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="mt-4">
            <Link href="/register">
              <Button variant="outline" className="w-full bg-transparent">
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Cuenta
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}