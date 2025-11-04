"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react" // Añadir useCallback
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, UploadCloud, X, ImageIcon, VideoIcon } from "lucide-react" // Importar iconos
import { apiClient } from "@/lib/api-client" 
import { useAuth } from "@/components/auth/auth-provider"
import { useDropzone } from "react-dropzone"; // Importar react-dropzone
import { toast } from "sonner";
import { cn } from "@/lib/utils"

interface BathroomDto {
  id: number;
  name: string;
  floor: number | null; 
  building: string | null; 
}

// Interface para el archivo subido
interface UploadedFile {
  url: string;
  publicId: string;
  filename: string;
  type: string;
}

export function CleaningForm() {
  const [bathrooms, setBathrooms] = useState<BathroomDto[]>([]) 
  const [selectedBathroom, setSelectedBathroom] = useState("")
  const [areasCleanedIds, setAreasCleanedIds] = useState<number[]>([]); 
  const [suppliesRefilledIds, setSuppliesRefilledIds] = useState<number[]>([]); 
  const [observations, setObservations] = useState("")
  
  // --- ESTADOS DE ARCHIVOS MEJORADOS ---
  const [files, setFiles] = useState<UploadedFile[]>([]); // Almacena archivos subidos
  const [isUploading, setIsUploading] = useState(false);
  // ------------------------------------
  
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingBathrooms, setIsFetchingBathrooms] = useState(true); 
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth(); 

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
    if (user) {
        fetchBathrooms();
    } else {
        setIsFetchingBathrooms(false); 
    }
  }, [user]) 

  const fetchBathrooms = async () => {
    setIsFetchingBathrooms(true);
    setError(""); 
    try {
      const data = await apiClient.getBathrooms(); 
      console.log("Baños recibidos:", data); 
      setBathrooms(data || [])
    } catch (error) {
      console.error("Error fetching bathrooms:", error)
      setError("No se pudieron cargar los baños. Verifica la conexión con el servidor."); 
      setBathrooms([]) 
    } finally {
      setIsFetchingBathrooms(false);
    }
  }

  const handleAreaChange = (areaId: number, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setAreasCleanedIds((prev) => [...prev, areaId]);
    } else {
      setAreasCleanedIds((prev) => prev.filter((id) => id !== areaId));
    }
  };

  const handleSupplyChange = (supplyId: number, checked: boolean | 'indeterminate') => {
     if (checked === true) {
      setSuppliesRefilledIds((prev) => [...prev, supplyId]);
    } else {
      setSuppliesRefilledIds((prev) => prev.filter((id) => id !== supplyId));
    }
  };


  // --- LÓGICA DE SUBIDA DE ARCHIVOS ---
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setIsUploading(true);
    setError("");

    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.uploadFile(formData);
        return {
          url: response.url,
          publicId: response.publicId,
          filename: file.name,
          type: response.type,
        } as UploadedFile;
      } catch (err) {
        console.error("Error al subir archivo:", err);
        const apiError = err instanceof Error ? err.message : "Error desconocido";
        const errorDetailMatch = apiError.match(/\{"error":"(.*?)"\}/);
        const finalError = errorDetailMatch ? errorDetailMatch[1] : apiError;
        toast.error(`Error al subir ${file.name}: ${finalError}`);
        setError(finalError); 
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((res): res is UploadedFile => res !== null);
    
    setFiles((prevFiles) => [...prevFiles, ...successfulUploads]);
    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
    },
    maxSize: 25 * 1024 * 1024,
  });

  const removeFile = async (fileToRemove: UploadedFile) => {
    setFiles((prevFiles) => prevFiles.filter(file => file.publicId !== fileToRemove.publicId));
    try {
      await apiClient.deleteFile(fileToRemove.publicId);
      toast.success(`Archivo "${fileToRemove.filename}" eliminado.`);
    } catch (err) {
      console.error("Error al eliminar archivo de Cloudinary:", err);
      toast.error("Error al eliminar archivo del servidor, pero fue quitado del reporte.");
    }
  };
  // ---------------------------------


const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Limpia errores al intentar enviar
    
    // --- VALIDACIÓN MEJORADA ---
    if (!selectedBathroom) {
      setError("Por favor selecciona un baño.")
      return
    }
    if (areasCleanedIds.length === 0) {
      setError("Debes seleccionar al menos un área limpiada.")
      return
    }
    if (suppliesRefilledIds.length === 0) {
      setError("Debes seleccionar al menos un suministro reabastecido.")
      return
    }
    // ---------------------------

    setIsLoading(true)
    setSuccess(false)

    try {
       await apiClient.createCleaningActivity({
        bathroomId: Number.parseInt(selectedBathroom),
        areasCleanedIds: areasCleanedIds,        
        suppliesRefilledIds: suppliesRefilledIds, 
        observations: observations.trim() || null,
        photos: files.map(f => f.url) // Solo envía las URLs
      });


      setSuccess(true)
      
      // --- ESTO RESUELVE EL PROBLEMA 3 ---
      setSelectedBathroom("")
      setAreasCleanedIds([]);
      setSuppliesRefilledIds([]);
      setObservations("")
      setFiles([]); // Vacía la lista de archivos
      // ---------------------------------

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Error registrando actividad:", err); 
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
          <div className="space-y-2">
            <Label htmlFor="bathroom">Seleccionar Baño *</Label>
            <Select
  value={selectedBathroom}
  onValueChange={setSelectedBathroom}
  required
  disabled={isFetchingBathrooms || isLoading} 
>
  {/* Añadimos 'truncate' aquí para cortar el texto seleccionado */}
  <SelectTrigger className="truncate">
    <SelectValue placeholder={isFetchingBathrooms ? "Cargando baños..." : "Selecciona el baño a limpiar"} />
  </SelectTrigger>
  <SelectContent>
    {isFetchingBathrooms ? (
      <SelectItem value="loading" disabled>Cargando...</SelectItem>
    ) : bathrooms.length === 0 ? (
      <SelectItem value="no-options" disabled>No hay baños disponibles</SelectItem>
    ) : (
      bathrooms.map((bathroom) => (
        // Añadimos 'truncate' aquí para cortar las opciones de la lista
        <SelectItem key={bathroom.id} value={bathroom.id.toString()} className="truncate">
          {`${bathroom.building || 'Edificio desc.'} - ${bathroom.floor ? `Piso ${bathroom.floor}` : 'Piso desc.'} - ${bathroom.name}`}
        </SelectItem>
      ))
    )}
  </SelectContent>
</Select>
             {!isFetchingBathrooms && bathrooms.length === 0 && error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
             )}
          </div>

          {/* Areas Cleaned */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Áreas Limpiadas *</Label>
            <div className="grid grid-cols-2 gap-3">
              {cleaningAreasMap.map(({ id, key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`area-${key}`} 
                    checked={areasCleanedIds.includes(id)}
                    onCheckedChange={(checked) => handleAreaChange(id, checked)}
                    disabled={isLoading || isUploading}
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
            <Label className="text-base font-medium">Suministros Reabastecidos *</Label>
            <div className="grid grid-cols-1 gap-3">
              {suppliesMap.map(({ id, key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`supply-${key}`} 
                    checked={suppliesRefilledIds.includes(id)}
                    onCheckedChange={(checked) => handleSupplyChange(id, checked)}
                     disabled={isLoading || isUploading}
                  />
                  <Label htmlFor={`supply-${key}`} className="text-sm font-normal cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* --- NUEVO BLOQUE DE SUBIDA DE ARCHIVOS --- */}
          <div className="space-y-2">
            <Label>Evidencia (Foto o Video)</Label>
            <div
              {...getRootProps()}
              className={cn(
                "border-input dark:bg-input/30 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors",
                isDragActive && "border-primary",
                (isUploading || isLoading) && "cursor-not-allowed opacity-50"
              )}
            >
              <input {...getInputProps()} disabled={isUploading || isLoading} />
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground">
                {isUploading ? "Subiendo..." : isDragActive ? "Suelta los archivos aquí" : "Arrastra y suelta o haz clic para subir"}
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-muted-foreground">Archivos adjuntos:</p>
                <ul className="grid grid-cols-1 gap-2">
                  {files.map((file) => (
                    <li
                      key={file.publicId}
                      className="flex items-center justify-between gap-2 rounded-md border bg-muted/50 p-2 text-sm"
                    >
                      <div className="flex flex-1 items-center gap-2 overflow-hidden">
                        {file.type.startsWith("image") ? (
                          <ImageIcon className="h-4 w-4 shrink-0" />
                        ) : (
                          <VideoIcon className="h-4 w-4 shrink-0" />
                        )}
                        <span className="truncate">{file.filename}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFile(file)}
                        disabled={isUploading || isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* --- FIN DEL NUEVO BLOQUE --- */}

          <div className="space-y-2">
            <Label htmlFor="observations">Notas Adicionales (Opcional)</Label>
            <Textarea
              id="observations"
              placeholder="Observaciones, comentarios o detalles adicionales..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
               disabled={isLoading || isUploading}
            />
          </div>

          {error && !error.includes("cargar los baños") && ( 
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

          <Button 
            type="submit" 
            className="w-full" 
            disabled={
              isLoading || 
              isFetchingBathrooms || 
              isUploading || 
              !selectedBathroom ||
              areasCleanedIds.length === 0 || // <-- AÑADIDO
              suppliesRefilledIds.length === 0 // <-- AÑADIDO
            }
          >
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