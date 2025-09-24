"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "@/components/ui/file-upload"
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react"

interface Bathroom {
  id: number
  name: string
  gender: string
  floor_name: string
  building_name: string
}

export function IncidentForm() {
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([])
  const [selectedBathroom, setSelectedBathroom] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null)
  const [evidenceType, setEvidenceType] = useState<"image" | "video" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBathrooms()
  }, [])

  const fetchBathrooms = async () => {
    try {
      const response = await fetch("/api/bathrooms")
      const data = await response.json()
      setBathrooms(data.bathrooms || [])
    } catch (error) {
      console.error("Error fetching bathrooms:", error)
    }
  }

  const handleFileUpload = (url: string, type: "image" | "video") => {
    setEvidenceUrl(url)
    setEvidenceType(type)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBathroom || !title.trim() || !description.trim()) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bathroom_id: Number.parseInt(selectedBathroom),
          title: title.trim(),
          description: description.trim(),
          priority,
          evidence_url: evidenceUrl,
          evidence_type: evidenceType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al reportar el incidente")
      }

      setSuccess(true)
      // Reset form
      setSelectedBathroom("")
      setTitle("")
      setDescription("")
      setPriority("medium")
      setEvidenceUrl(null)
      setEvidenceType(null)

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reportar el incidente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Reportar Incidente
        </CardTitle>
        <CardDescription>Reporta daños, problemas o situaciones que requieren atención</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bathroom Selection */}
          <div className="space-y-2">
            <Label htmlFor="bathroom">Seleccionar Baño *</Label>
            <Select value={selectedBathroom} onValueChange={setSelectedBathroom}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el baño donde ocurrió el incidente" />
              </SelectTrigger>
              <SelectContent>
                {bathrooms.map((bathroom) => (
                  <SelectItem key={bathroom.id} value={bathroom.id.toString()}>
                    {bathroom.building_name} - {bathroom.floor_name} - {bathroom.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título del Incidente *</Label>
            <Input
              id="title"
              placeholder="Ej: Grifo con fuga, Espejo roto, Inodoro obstruido..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja - No urgente</SelectItem>
                <SelectItem value="medium">Media - Atención normal</SelectItem>
                <SelectItem value="high">Alta - Requiere atención inmediata</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Problema *</Label>
            <Textarea
              id="description"
              placeholder="Describe detalladamente el problema encontrado, su ubicación exacta y cualquier información relevante..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>Evidencia (Foto o Video)</Label>
            <FileUpload onUpload={handleFileUpload} />
            <p className="text-xs text-muted-foreground">
              Adjunta una foto o video que muestre el problema para facilitar su resolución
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Incidente reportado exitosamente. El equipo de mantenimiento será notificado.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reportando...
              </>
            ) : (
              "Reportar Incidente"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
