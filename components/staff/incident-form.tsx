"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle, UploadCloud, X, ImageIcon, VideoIcon } from "lucide-react"
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/components/auth/auth-provider";
import { useDropzone } from "react-dropzone"; 
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

export function IncidentForm() {
  const [bathrooms, setBathrooms] = useState<BathroomDto[]>([])
  const [selectedBathroom, setSelectedBathroom] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  
  const [files, setFiles] = useState<UploadedFile[]>([]); 
  const [isUploading, setIsUploading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingBathrooms, setIsFetchingBathrooms] = useState(true);
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth(); 

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
      setBathrooms(data || [])
    } catch (error) {
      console.error("Error fetching bathrooms:", error)
      setError("No se pudieron cargar los baños."); 
      setBathrooms([])
    } finally {
      setIsFetchingBathrooms(false);
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setIsUploading(true);
    setError("");

    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        // Llama a uploadFile (que ahora acepta FormData y devuelve publicId)
        const response = await apiClient.uploadFile(formData);
        return {
          url: response.url,
          publicId: response.publicId, // Ahora esto existe
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
      // Llama a deleteFile (que ahora existe)
      await apiClient.deleteFile(fileToRemove.publicId); 
      toast.success(`Archivo "${fileToRemove.filename}" eliminado.`);
    } catch (err) {
      console.error("Error al eliminar archivo de Cloudinary:", err);
      toast.error("Error al eliminar archivo del servidor, pero fue quitado del reporte.");
    }
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

    const incidentPayload = {
        bathroomId: Number.parseInt(selectedBathroom),
        title: title.trim(),
        description: description.trim() || null,
        priority: priority,
        photos: files.map(f => f.url) 
    };

    try {
      await apiClient.createIncident(incidentPayload);
      setSuccess(true)
      
      // Resuelve el problema 3: vacía la lista de archivos
      setSelectedBathroom("")
      setTitle("")
      setDescription("")
      setPriority("medium")
      setFiles([]); // <-- ¡AQUÍ!
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Error reportando incidente:", err);
      const apiError = err instanceof Error ? err.message : "Error desconocido";
      const errorDetailMatch = apiError.match(/\{"error":"(.*?)"\}/);
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
           <div className="space-y-2">
            <Label htmlFor="bathroom">Seleccionar Baño *</Label>
            <Select
                value={selectedBathroom}
                onValueChange={setSelectedBathroom}
                required
                disabled={isFetchingBathrooms || isLoading}
            >
              <SelectTrigger id="bathroom" className="max-w-full truncate">
              <SelectValue
                placeholder={
                  isFetchingBathrooms ? "Cargando baños..." : "Selecciona el baño"
                }
              />
            </SelectTrigger>
              <SelectContent>
                 {isFetchingBathrooms ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                ) : bathrooms.length === 0 ? (
                    <SelectItem value="no-options" disabled>No hay baños disponibles</SelectItem>
                ) : (
                  bathrooms.map((bathroom) => (
                    <SelectItem
                    key={bathroom.id}
                    value={bathroom.id.toString()}
                    className="truncate max-w-[90vw]" // evita que se salga de pantalla
                  >
                    {`${bathroom.building || 'Edif.?'} - ${bathroom.floor ? `Piso ${bathroom.floor}` : 'Piso?'} - ${bathroom.name}`}
                  </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Título del Incidente *</Label>
            <Input id="title" placeholder="Ej: Grifo con fuga..." value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isLoading || isUploading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as "low" | "medium" | "high")} disabled={isLoading || isUploading}>
              <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja - No urgente</SelectItem>
                <SelectItem value="medium">Media - Atención normal</SelectItem>
                <SelectItem value="high">Alta - Requiere atención inmediata</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Problema *</Label>
            <Textarea id="description" placeholder="Describe detalladamente el problema..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required disabled={isLoading || isUploading} />
          </div>

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

          {error && (
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

          <Button type="submit" className="w-full" disabled={isLoading || isFetchingBathrooms || isUploading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reportando...</>
            ) : (
              "Reportar Incidente"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}