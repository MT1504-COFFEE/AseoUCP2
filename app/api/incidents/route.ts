import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const { bathroom_id, title, description, evidence_url, evidence_type, priority = "medium" } = await request.json()

    const result = await db.execute(
      `
      INSERT INTO incidents (
        user_id, bathroom_id, title, description, 
        evidence_url, evidence_type, priority, reported_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [user.id, bathroom_id, title, description, evidence_url, evidence_type, priority],
    )

    return NextResponse.json({
      message: "Incidente reportado exitosamente",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Error creating incident:", error)
    return NextResponse.json({ error: "Error al reportar el incidente" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const incidents = await db.query(`
      SELECT i.*, u.full_name, b.name as bathroom_name,
             f.name as floor_name, buildings.name as building_name
      FROM incidents i
      JOIN users u ON i.user_id = u.id
      JOIN bathrooms b ON i.bathroom_id = b.id
      JOIN floors f ON b.floor_id = f.id
      JOIN buildings ON f.building_id = buildings.id
      ORDER BY i.reported_at DESC
    `)

    return NextResponse.json({ incidents })
  } catch (error) {
    console.error("Error fetching incidents:", error)
    return NextResponse.json({ error: "Error al obtener los incidentes" }, { status: 500 })
  }
}
