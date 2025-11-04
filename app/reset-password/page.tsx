"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") // Lee el token de la URL

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Token no encontrado. Asegúrate de usar el enlace de tu correo.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (!token) {
      setError("Token no válido.")
      return
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    setIsLoading(true)
    try {
      await apiClient.resetPassword(token, password)
      setSuccess(true)
    } catch (err) {
      console.error("Error en reset password:", err)
      const apiError = err instanceof Error ? err.message : "Error desconocido";
      const errorDetailMatch = apiError.match(/\{"error":"(.*?)"\}/);
      setError(errorDetailMatch ? errorDetailMatch[1] : "Ocurrió un error en el servidor.");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/Catolica.jpg')] bg-cover bg-center bg-no-repeat bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-balance">Crear Nueva Contraseña</CardTitle>
          <CardDescription className="text-pretty">
            Ingresa tu nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <Alert className="border-green-500 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>¡Éxito!</AlertTitle>
                <AlertDescription>
                  Tu contraseña ha sido actualizada. Ya puedes iniciar sesión.
                </AlertDescription>
              </Alert>
              <Link href="/login">
                <Button className="w-full">
                  Ir a Inicio de Sesión
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || !token}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading || !token}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !token}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Contraseña"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Usamos Suspense para poder leer los searchParams
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}