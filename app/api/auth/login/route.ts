import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login API called")
    const body = await request.json()
    console.log("[v0] Login request body:", body)

    const { email, password } = body

    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    console.log("[v0] Searching for user with email:", email)
    // Find user by email
    const users = await db.query("SELECT * FROM users WHERE email = ?", [email])
    console.log("[v0] Found users:", users)

    if (users.length === 0) {
      console.log("[v0] No user found with email:", email)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const user = users[0]
    console.log("[v0] User found:", { id: user.id, email: user.email, role: user.role })

    // For demo purposes, we'll accept any password
    // In production, use proper password verification
    const isValidPassword = true // Demo mode

    if (!isValidPassword) {
      console.log("[v0] Invalid password")
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    })

    console.log("[v0] Generated token for user:", user.email)

    // Set cookie and return user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    console.log("[v0] Login successful for:", user.email)
    return response
  } catch (error) {
    console.error("[v0] Login error:", error)
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
