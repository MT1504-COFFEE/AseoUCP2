"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, X, FileImage, FileVideo, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client" // 1. IMPORTAMOS NUESTRO apiClient

interface FileUploadProps {
  onUpload: (url: string, type: "image" | "video") => void
  accept?: string
  maxSize?: number
  className?: string
}

export function FileUpload({
  onUpload,
  accept = "image/*,video/*",
  maxSize = 10 * 1024 * 1024, // 10MB
  className = "",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [uploadedFile, setUploadedFile] = useState<{ url: string; type: string; filename: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError("")
    setIsUploading(true)
    setUploadProgress(0)

    try {
      if (file.size > maxSize) {
        throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${Math.round(maxSize / 1024 / 1024)}MB`)
      }

      // 2. USAMOS el apiClient para subir el archivo.
      // Este se encargará de enviarlo al backend de Spring Boot Y de añadir el token de autenticación.
      const data = await apiClient.uploadFile(file);

      setUploadProgress(100) // Simulación final

      setUploadedFile({
        url: data.url,
        type: data.type,
        filename: data.filename,
      })

      onUpload(data.url, data.type as "image" | "video")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo")
    } finally {
      setIsUploading(false)
    }
  }

  // El resto del archivo no cambia...
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeFile = () => {
    setUploadedFile(null)
    onUpload("", "image"); // Limpiamos la URL en el formulario padre
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />

      {!uploadedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <Camera className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Subir evidencia</p>
              <p className="text-xs text-muted-foreground">Arrastra y suelta o haz clic para seleccionar</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {uploadedFile.type === "video" ? (
                <FileVideo className="h-5 w-5 text-blue-500" />
              ) : (
                <FileImage className="h-5 w-5 text-green-500" />
              )}
              <div>
                <p className="text-sm font-medium">{uploadedFile.filename}</p>
                <p className="text-xs text-muted-foreground">Archivo subido</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={removeFile} className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mt-4 space-y-2">
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}