"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Building2, UserPlus } from "lucide-react"
import Link from "next/link"

export function LoginForm() {
  const { login } = useAuth() 
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await login(email, password)
    } catch (err) {
      console.error("Login error:", err)
      setError("Correo electrónico o contraseña incorrectos. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

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

            {/* --- CÓDIGO AÑADIDO --- */}
            <div className="text-sm text-center">
              <Link 
                href="#" 
                className="font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  // Aún no tenemos el backend para esto, así que mostramos un alert
                  alert("Función 'Olvidé mi contraseña' aún no implementada.");
                }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            {/* --------------------- */}

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