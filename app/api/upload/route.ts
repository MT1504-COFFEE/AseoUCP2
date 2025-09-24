import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP) y videos (MP4, WebM)" },
        { status: 400 },
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "El archivo es demasiado grande. Tamaño máximo: 10MB" }, { status: 400 })
    }

    // In a real application, you would upload to a cloud storage service
    // For demo purposes, we'll return a placeholder URL
    const fileExtension = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

    // Simulate file upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return a placeholder URL that represents the uploaded file
    const uploadedUrl = file.type.startsWith("video/")
      ? `/placeholder.svg?height=400&width=600&query=uploaded video evidence`
      : `/placeholder.svg?height=400&width=600&query=uploaded photo evidence`

    return NextResponse.json({
      url: uploadedUrl,
      type: file.type.startsWith("video/") ? "video" : "image",
      filename: fileName,
      size: file.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
  }
}
