import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const bathrooms = await db.query(`
      SELECT b.*, f.name as floor_name, f.floor_number, 
             buildings.name as building_name, buildings.code as building_code
      FROM bathrooms b
      JOIN floors f ON b.floor_id = f.id
      JOIN buildings ON f.building_id = buildings.id
      ORDER BY buildings.name, f.floor_number, b.gender
    `)

    return NextResponse.json({ bathrooms })
  } catch (error) {
    console.error("Error fetching bathrooms:", error)
    return NextResponse.json({ error: "Error al obtener los baños" }, { status: 500 })
  }
}
