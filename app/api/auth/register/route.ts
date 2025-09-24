import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Register API called")
    const body = await request.json()
    console.log("[v0] Register request body:", body)

    const { email, password, fullName, role } = body

    if (!email || !password || !fullName || !role) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    console.log("[v0] Checking if user exists:", email)
    // Check if user already exists
    const existingUsers = await db.query("SELECT * FROM users WHERE email = ?", [email])
    console.log("[v0] Existing users found:", existingUsers.length)

    if (existingUsers.length > 0) {
      console.log("[v0] User already exists:", email)
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 })
    }

    console.log("[v0] Creating new user:", { email, fullName, role })
    // Create new user
    const result = await db.execute("INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)", [
      email,
      "hashed_password",
      fullName,
      role,
    ])

    console.log("[v0] User creation result:", result)

    if (!result.insertId) {
      throw new Error("Error al crear el usuario")
    }

    // Generate JWT token
    const token = generateToken({
      id: result.insertId,
      email,
      full_name: fullName,
      role,
    })

    console.log("[v0] Generated token for new user:", email)

    // Set cookie and return user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.insertId,
        email,
        full_name: fullName,
        role,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    console.log("[v0] Registration successful for:", email)
    return response
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
