"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await apiClient.forgotPassword(email)
      setSuccess(true)
    } catch (err) {
      console.error("Error en forgot password:", err)
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
          <CardTitle className="text-2xl font-bold text-balance">Restablecer Contraseña</CardTitle>
          <CardDescription className="text-pretty">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <Alert className="border-green-500 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>¡Correo Enviado!</AlertTitle>
                <AlertDescription>
                  Si el correo <span className="font-medium">{email}</span> está registrado, recibirás un enlace en tu bandeja de entrada.
                </AlertDescription>
              </Alert>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Inicio de Sesión
                </Button>
              </Link>
            </div>
          ) : (
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

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Enlace"
                )}
              </Button>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Recordé mi contraseña
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}