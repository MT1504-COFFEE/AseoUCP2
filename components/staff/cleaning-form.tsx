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
import { apiClient } from "@/lib/api-client" // Importa apiClient
import { useAuth } from "@/components/auth/auth-provider" // Importa useAuth para obtener el token

// Define la interfaz como la esperamos del backend (BathroomDto)
interface BathroomDto {
  id: number;
  name: string;
  floor: number | null; // Puede ser null si no hay piso
  building: string | null; // Puede ser null si no hay edificio
}


export function CleaningForm() {
  const [bathrooms, setBathrooms] = useState<BathroomDto[]>([]) // Usa BathroomDto
  const [selectedBathroom, setSelectedBathroom] = useState("")
  const [areasCleanedIds, setAreasCleanedIds] = useState<number[]>([]); // Almacena IDs
  const [suppliesRefilledIds, setSuppliesRefilledIds] = useState<number[]>([]); // Almacena IDs
  const [observations, setObservations] = useState("")
  const [photos, setPhotos] = useState<string[]>([]); // Almacena URLs de fotos subidas
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingBathrooms, setIsFetchingBathrooms] = useState(true); // Estado para carga de baños
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth(); // Obtén el usuario para asegurar autenticación

  // Opcional: Define IDs para áreas y suministros (si no vienen del backend)
  const cleaningAreasMap = [
    { id: 1, key: "toilets", label: "Sanitarios" },
    { id: 2, key: "sinks", label: "Lavamanos" },
    { id: 3, key: "mirrors", label: "Espejos" },
    { id: 4, key: "walls", label: "Paredes" },
    { id: 5, key: "floors", label: "Pisos" },
    { id: 6, key: "doors", label: "Puertas" },
  ];
  const suppliesMap = [
    { id: 1, key: "toilet_paper", label: "Papel higiénico" },
    { id: 2, key: "paper_towels", label: "Toallas de papel" },
    { id: 3, key: "soap", label: "Jabón" },
  ];

  useEffect(() => {
    // Solo intenta cargar baños si el usuario está autenticado
    if (user) {
        fetchBathrooms();
    } else {
        setIsFetchingBathrooms(false); // Si no hay usuario, no cargues
    }
  }, [user]) // Depende del estado del usuario

  const fetchBathrooms = async () => {
    setIsFetchingBathrooms(true);
    setError(""); // Limpia errores previos
    try {
      // --- CORRECCIÓN AQUÍ ---
      // Usa apiClient para llamar al endpoint correcto
      const data = await apiClient.getBathrooms(); // Asume que getBathrooms devuelve BathroomDto[]
      console.log("Baños recibidos:", data); // Verifica qué llega del backend
      setBathrooms(data || [])
    } catch (error) {
      console.error("Error fetching bathrooms:", error)
      setError("No se pudieron cargar los baños. Verifica la conexión con el servidor."); // Mensaje de error más útil
      setBathrooms([]) // Asegura que la lista esté vacía en caso de error
    } finally {
      setIsFetchingBathrooms(false);
    }
  }

  // Manejador para checkboxes de Áreas
  const handleAreaChange = (areaId: number, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setAreasCleanedIds((prev) => [...prev, areaId]);
    } else {
      setAreasCleanedIds((prev) => prev.filter((id) => id !== areaId));
    }
  };

  // Manejador para checkboxes de Suministros
  const handleSupplyChange = (supplyId: number, checked: boolean | 'indeterminate') => {
     if (checked === true) {
      setSuppliesRefilledIds((prev) => [...prev, supplyId]);
    } else {
      setSuppliesRefilledIds((prev) => prev.filter((id) => id !== supplyId));
    }
  };


  const handleFileUpload = (url: string, type: "image" | "video") => {
     // Añade la URL a la lista de fotos
     if (url) {
       setPhotos((prev) => [...prev, url]);
     }
  }
   // Función para quitar una foto específica (si implementas la UI para ello)
   const removePhoto = (urlToRemove: string) => {
    setPhotos((prev) => prev.filter(url => url !== urlToRemove));
   };


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
        // --- CORRECCIÓN EN EL ENVÍO ---
        // Usa apiClient y la estructura de CleaningActivityRequest
       await apiClient.createCleaningActivity({
        bathroomId: Number.parseInt(selectedBathroom),
        areasCleanedIds: areasCleanedIds,        // Envía la lista de IDs
        suppliesRefilledIds: suppliesRefilledIds, // Envía la lista de IDs
        observations: observations.trim() || null,
        photos: photos                         // Envía la lista de URLs
      });


      setSuccess(true)
      // Reset form
      setSelectedBathroom("")
      setAreasCleanedIds([]);
      setSuppliesRefilledIds([]);
      setObservations("")
      setPhotos([]);
      // TODO: Considera resetear el componente FileUpload si es necesario

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Error registrando actividad:", err); // Loguea el error real
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
            <Label htmlFor="bathroom">Seleccionar Baño *</Label>
            <Select
              value={selectedBathroom}
              onValueChange={setSelectedBathroom}
              required
              disabled={isFetchingBathrooms || isLoading} // Deshabilita mientras carga
            >
              <SelectTrigger>
                <SelectValue placeholder={isFetchingBathrooms ? "Cargando baños..." : "Selecciona el baño a limpiar"} />
              </SelectTrigger>
              <SelectContent>
                {isFetchingBathrooms ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                ) : bathrooms.length === 0 ? (
                    <SelectItem value="no-options" disabled>No hay baños disponibles</SelectItem>
                ) : (
                  bathrooms.map((bathroom) => (
                    // Muestra Nombre - Piso - Edificio si están disponibles
                    <SelectItem key={bathroom.id} value={bathroom.id.toString()}>
                      {`${bathroom.building || 'Edificio desc.'} - ${bathroom.floor ? `Piso ${bathroom.floor}` : 'Piso desc.'} - ${bathroom.name}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
             {/* Muestra error si no se pudieron cargar los baños */}
             {!isFetchingBathrooms && bathrooms.length === 0 && error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
             )}
          </div>

          {/* Areas Cleaned */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Áreas Limpiadas</Label>
            <div className="grid grid-cols-2 gap-3">
              {cleaningAreasMap.map(({ id, key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`area-${key}`} // ID único
                    checked={areasCleanedIds.includes(id)}
                    onCheckedChange={(checked) => handleAreaChange(id, checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`area-${key}`} className="text-sm font-normal cursor-pointer">
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
              {suppliesMap.map(({ id, key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`supply-${key}`} // ID único
                    checked={suppliesRefilledIds.includes(id)}
                    onCheckedChange={(checked) => handleSupplyChange(id, checked)}
                     disabled={isLoading}
                  />
                  <Label htmlFor={`supply-${key}`} className="text-sm font-normal cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>Evidencia (Foto o Video)</Label>
            {/* TODO: Modifica FileUpload si necesitas mostrar múltiples archivos o permitir quitarlos */}
            <FileUpload onUpload={handleFileUpload} />
             {/* Opcional: Mostrar lista de archivos subidos */}
             {photos.length > 0 && (
                <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Archivos subidos:</p>
                    <ul className="list-disc list-inside text-xs">
                        {photos.map((url, index) => (
                            <li key={index} className="truncate">
                                {url.substring(url.lastIndexOf('/') + 1)}
                                {/* Podrías añadir un botón para llamar a removePhoto(url) */}
                            </li>
                        ))}
                    </ul>
                </div>
             )}
          </div>

          {/* Observations (antes Notes) */}
          <div className="space-y-2">
            <Label htmlFor="observations">Notas Adicionales (Opcional)</Label>
            <Textarea
              id="observations"
              placeholder="Observaciones, comentarios o detalles adicionales..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
               disabled={isLoading}
            />
          </div>

          {/* Muestra error de envío o selección */}
          {error && !error.includes("cargar los baños") && ( // No mostrar error de carga aquí
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

          <Button type="submit" className="w-full" disabled={isLoading || isFetchingBathrooms || !selectedBathroom}>
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