"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "@/components/ui/file-upload"
import { Loader2, CheckCircle } from "lucide-react"

interface Bathroom {
  id: number
  name: string
  gender: string
  floor_name: string
  building_name: string
}

export function CleaningForm() {
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([])
  const [selectedBathroom, setSelectedBathroom] = useState("")
  const [areasChecked, setAreasChecked] = useState({
    toilets: false,
    sinks: false,
    mirrors: false,
    walls: false,
    floors: false,
    doors: false,
  })
  const [suppliesRestocked, setSuppliesRestocked] = useState({
    toilet_paper: false,
    paper_towels: false,
    soap: false,
  })
  const [notes, setNotes] = useState("")
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
      const response = await fetch("http://localhost:8080/api/incidents")
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
    if (!selectedBathroom) {
      setError("Por favor selecciona un baño")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/cleaning-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bathroom_id: Number.parseInt(selectedBathroom),
          areas_cleaned: areasChecked,
          supplies_restocked: suppliesRestocked,
          evidence_url: evidenceUrl,
          evidence_type: evidenceType,
          notes: notes.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar la actividad")
      }

      setSuccess(true)
      // Reset form
      setSelectedBathroom("")
      setAreasChecked({
        toilets: false,
        sinks: false,
        mirrors: false,
        walls: false,
        floors: false,
        doors: false,
      })
      setSuppliesRestocked({
        toilet_paper: false,
        paper_towels: false,
        soap: false,
      })
      setNotes("")
      setEvidenceUrl(null)
      setEvidenceType(null)

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar la actividad")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Registrar Actividad de Limpieza
        </CardTitle>
        <CardDescription>Completa el formulario para registrar las tareas de limpieza realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bathroom Selection */}
          <div className="space-y-2">
            <Label htmlFor="bathroom">Seleccionar Baño</Label>
            <Select value={selectedBathroom} onValueChange={setSelectedBathroom}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el baño a limpiar" />
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

          {/* Areas Cleaned */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Áreas Limpiadas</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "toilets", label: "Sanitarios" },
                { key: "sinks", label: "Lavamanos" },
                { key: "mirrors", label: "Espejos" },
                { key: "walls", label: "Paredes" },
                { key: "floors", label: "Pisos" },
                { key: "doors", label: "Puertas" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={areasChecked[key as keyof typeof areasChecked]}
                    onCheckedChange={(checked) => setAreasChecked((prev) => ({ ...prev, [key]: checked }))}
                  />
                  <Label htmlFor={key} className="text-sm font-normal">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Supplies Restocked */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Suministros Reabastecidos</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: "toilet_paper", label: "Papel higiénico" },
                { key: "paper_towels", label: "Toallas de papel" },
                { key: "soap", label: "Jabón" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={suppliesRestocked[key as keyof typeof suppliesRestocked]}
                    onCheckedChange={(checked) => setSuppliesRestocked((prev) => ({ ...prev, [key]: checked }))}
                  />
                  <Label htmlFor={key} className="text-sm font-normal">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>Evidencia (Foto o Video)</Label>
            <FileUpload onUpload={handleFileUpload} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones, comentarios o detalles adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Actividad de limpieza registrada exitosamente</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              "Registrar Actividad"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
