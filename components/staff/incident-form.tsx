"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react" // Añade useRef
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "@/components/ui/file-upload"
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"; // Importa apiClient
import { useAuth } from "@/components/auth/auth-provider"; // Importa useAuth

// Interfaz que coincide con BathroomDto del backend
interface BathroomDto {
  id: number;
  name: string;
  floor: number | null;
  building: string | null;
}

// Interfaz para el payload de creación de incidente
interface IncidentPayload {
    bathroomId: number;
    title: string;
    description: string | null;
    priority: "low" | "medium" | "high";
    photos: string[];
}


export function IncidentForm() {
  const [bathrooms, setBathrooms] = useState<BathroomDto[]>([]) // Usa BathroomDto
  const [selectedBathroom, setSelectedBathroom] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium"); // Tipado explícito
  const [photos, setPhotos] = useState<string[]>([]); // Almacena URLs de fotos
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingBathrooms, setIsFetchingBathrooms] = useState(true); // Estado para carga
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth(); // Obtén usuario
  const fileUploadRef = useRef<{ reset: () => void }>(null); // Ref para resetear FileUpload

  useEffect(() => {
     if (user) { // Carga baños si hay usuario
        fetchBathrooms();
    } else {
        setIsFetchingBathrooms(false); // No cargar si no hay usuario
    }
  }, [user])

  const fetchBathrooms = async () => {
    setIsFetchingBathrooms(true);
    setError(""); // Limpia errores previos al cargar
    try {
      // --- CORRECCIÓN AQUÍ ---
      const data = await apiClient.getBathrooms(); // Usa apiClient.getBathrooms
      console.log("Baños recibidos (IncidentForm):", data); // Verifica
      setBathrooms(data || [])
    } catch (error) {
      console.error("Error fetching bathrooms:", error)
      setError("No se pudieron cargar los baños."); // Mensaje específico
      setBathrooms([])
    } finally {
      setIsFetchingBathrooms(false);
    }
  }

  const handleFileUpload = (url: string, type: "image" | "video") => {
    if (url) {
        setPhotos((prev) => [...prev, url]);
    }
  }
   // Función para quitar una foto (si la UI lo permite)
   const removePhoto = (urlToRemove: string) => {
    setPhotos((prev) => prev.filter(url => url !== urlToRemove));
   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBathroom || !title.trim() || !description.trim()) {
      setError("Por favor completa todos los campos requeridos (*)")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    // Construye el payload según la interfaz
    const incidentPayload: IncidentPayload = {
        bathroomId: Number.parseInt(selectedBathroom),
        title: title.trim(),
        description: description.trim() || null,
        priority: priority,
        photos: photos
    };


    try {
      // --- CORRECCIÓN AQUÍ ---
      // Usa apiClient.createIncident con el payload correcto
      await apiClient.createIncident(incidentPayload);

      setSuccess(true)
      // Reset form
      setSelectedBathroom("")
      setTitle("")
      setDescription("")
      setPriority("medium")
      setPhotos([]);
      // Resetea el componente FileUpload si tienes la ref configurada
      // fileUploadRef.current?.reset(); // Necesitarías exponer un método reset en FileUpload

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Error reportando incidente:", err);
      // Intenta obtener un mensaje más específico del error si es posible
      const apiError = err instanceof Error ? err.message : "Error desconocido";
      const errorDetailMatch = apiError.match(/\{"error":"(.*?)"\}/); // Intenta extraer el JSON
      setError(errorDetailMatch ? errorDetailMatch[1] : apiError);
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
            <Select
                value={selectedBathroom}
                onValueChange={setSelectedBathroom}
                required
                disabled={isFetchingBathrooms || isLoading}
            >
              <SelectTrigger id="bathroom">
                <SelectValue placeholder={isFetchingBathrooms ? "Cargando baños..." : "Selecciona el baño donde ocurrió el incidente"} />
              </SelectTrigger>
              <SelectContent>
                 {isFetchingBathrooms ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                ) : bathrooms.length === 0 ? (
                    <SelectItem value="no-options" disabled>No hay baños disponibles</SelectItem>
                ) : (
                  bathrooms.map((bathroom) => (
                    <SelectItem key={bathroom.id} value={bathroom.id.toString()}>
                      {`${bathroom.building || 'Edif.?'} - ${bathroom.floor ? `Piso ${bathroom.floor}` : 'Piso?'} - ${bathroom.name}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
             {!isFetchingBathrooms && bathrooms.length === 0 && error.includes("cargar los baños") && (
                <p className="text-sm text-destructive mt-1">{error}</p>
             )}
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
              disabled={isLoading}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as "low" | "medium" | "high")} disabled={isLoading}>
              <SelectTrigger id="priority">
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
              disabled={isLoading}
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>Evidencia (Foto o Video)</Label>
            {/* Si necesitas resetearlo, pasa la ref: <FileUpload ref={fileUploadRef} onUpload={handleFileUpload} /> */}
            <FileUpload onUpload={handleFileUpload} />
             {/* Opcional: Mostrar lista de archivos subidos */}
             {photos.length > 0 && (
                <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Archivos subidos:</p>
                    <ul className="list-disc list-inside text-xs">
                        {photos.map((url, index) => (
                            <li key={index} className="truncate">
                                {url.substring(url.lastIndexOf('/') + 1)}
                                {/* Podrías añadir un botón aquí para llamar a removePhoto(url) */}
                            </li>
                        ))}
                    </ul>
                </div>
             )}
            <p className="text-xs text-muted-foreground">
              Adjunta una foto o video que muestre el problema para facilitar su resolución
            </p>
          </div>

          {error && !error.includes("cargar los baños") && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Incidente reportado exitosamente.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || isFetchingBathrooms || !selectedBathroom}>
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

// Asegúrate de importar Label o tenerla definida globalmente
// import { Label } from "@/components/ui/label";