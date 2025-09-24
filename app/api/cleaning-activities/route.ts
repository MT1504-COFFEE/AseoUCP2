import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const { bathroom_id, areas_cleaned, supplies_restocked, evidence_url, evidence_type, notes } = await request.json()

    const result = await db.execute(
      `
      INSERT INTO cleaning_activities (
        user_id, bathroom_id, cleaned_at,
        toilets_cleaned, sinks_cleaned, mirrors_cleaned, 
        walls_cleaned, floors_cleaned, doors_cleaned,
        toilet_paper_restocked, paper_towels_restocked, soap_restocked,
        evidence_url, evidence_type, notes
      ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        user.id,
        bathroom_id,
        areas_cleaned.toilets || false,
        areas_cleaned.sinks || false,
        areas_cleaned.mirrors || false,
        areas_cleaned.walls || false,
        areas_cleaned.floors || false,
        areas_cleaned.doors || false,
        supplies_restocked.toilet_paper || false,
        supplies_restocked.paper_towels || false,
        supplies_restocked.soap || false,
        evidence_url,
        evidence_type,
        notes,
      ],
    )

    return NextResponse.json({
      message: "Actividad registrada exitosamente",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Error creating cleaning activity:", error)
    return NextResponse.json({ error: "Error al registrar la actividad" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = user.role === "admin" ? null : user.id

    let query = `
      SELECT ca.*, u.full_name, b.name as bathroom_name,
             f.name as floor_name, buildings.name as building_name
      FROM cleaning_activities ca
      JOIN users u ON ca.user_id = u.id
      JOIN bathrooms b ON ca.bathroom_id = b.id
      JOIN floors f ON b.floor_id = f.id
      JOIN buildings ON f.building_id = buildings.id
    `

    const params: any[] = []

    if (userId) {
      query += " WHERE ca.user_id = ?"
      params.push(userId)
    }

    query += " ORDER BY ca.cleaned_at DESC LIMIT 50"

    const activities = await db.query(query, params)

    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Error fetching cleaning activities:", error)
    return NextResponse.json({ error: "Error al obtener las actividades" }, { status: 500 })
  }
}
