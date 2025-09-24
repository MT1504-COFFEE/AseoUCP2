// Database connection and query utilities
// In a real application, you would use a proper MySQL connection

export interface DatabaseConnection {
  query: (sql: string, params?: any[]) => Promise<any[]>
  execute: (sql: string, params?: any[]) => Promise<{ insertId?: number; affectedRows?: number }>
}

// Mock database for demo purposes
// In production, replace with actual MySQL connection
class MockDatabase implements DatabaseConnection {
  private users = [
    {
      id: 1,
      email: "admin@institucion.edu",
      password_hash: "hashed_password",
      full_name: "Administrador Principal",
      role: "admin",
    },
    {
      id: 2,
      email: "maria.garcia@institucion.edu",
      password_hash: "hashed_password",
      full_name: "María García",
      role: "cleaning_staff",
    },
    {
      id: 3,
      email: "juan.perez@institucion.edu",
      password_hash: "hashed_password",
      full_name: "Juan Pérez",
      role: "cleaning_staff",
    },
  ]

  private buildings = [
    { id: 1, name: "Edificio Principal", code: "EP" },
    { id: 2, name: "Edificio Norte", code: "EN" },
    { id: 3, name: "Edificio Sur", code: "ES" },
  ]

  private floors = [
    { id: 1, building_id: 1, floor_number: 1, name: "Planta Baja" },
    { id: 2, building_id: 1, floor_number: 2, name: "Primer Piso" },
    { id: 3, building_id: 1, floor_number: 3, name: "Segundo Piso" },
  ]

  private bathrooms = [
    { id: 1, floor_id: 1, gender: "men", name: "Baño Hombres PB - EP" },
    { id: 2, floor_id: 1, gender: "women", name: "Baño Mujeres PB - EP" },
    { id: 3, floor_id: 2, gender: "men", name: "Baño Hombres P1 - EP" },
    { id: 4, floor_id: 2, gender: "women", name: "Baño Mujeres P1 - EP" },
  ]

  private cleaningActivities: any[] = []
  private incidents: any[] = [
    {
      id: 1,
      user_id: 2,
      bathroom_id: 1,
      title: "Grifo con fuga",
      description: "El grifo del lavamanos central tiene una fuga constante",
      status: "reported",
      priority: "high",
      reported_at: new Date("2024-01-15T11:30:00"),
      evidence_url: null,
    },
  ]

  async query(sql: string, params: any[] = []): Promise<any[]> {
    console.log("[v0] Database query:", sql, params)

    // Simple SQL parsing for demo
    const sqlLower = sql.toLowerCase().trim()

    if (sqlLower.includes("select * from users where email")) {
      const email = params[0]
      const result = this.users.filter((u) => u.email === email)
      console.log("[v0] User query result:", result)
      return result
    }

    if (sqlLower.includes("select * from buildings")) {
      return this.buildings
    }

    if (sqlLower.includes("select f.*, b.name as building_name")) {
      return this.floors.map((f) => ({
        ...f,
        building_name: this.buildings.find((b) => b.id === f.building_id)?.name,
      }))
    }

    if (sqlLower.includes("select b.*, f.name as floor_name")) {
      return this.bathrooms.map((b) => ({
        ...b,
        floor_name: this.floors.find((f) => f.id === b.floor_id)?.name,
        building_name: this.buildings.find(
          (building) => building.id === this.floors.find((f) => f.id === b.floor_id)?.building_id,
        )?.name,
      }))
    }

    if (sqlLower.includes("select i.*, u.full_name, b.name as bathroom_name")) {
      return this.incidents.map((i) => ({
        ...i,
        full_name: this.users.find((u) => u.id === i.user_id)?.full_name,
        bathroom_name: this.bathrooms.find((b) => b.id === i.bathroom_id)?.name,
      }))
    }

    if (sqlLower.includes("select ca.*, u.full_name, b.name as bathroom_name")) {
      return this.cleaningActivities.map((ca) => ({
        ...ca,
        full_name: this.users.find((u) => u.id === ca.user_id)?.full_name,
        bathroom_name: this.bathrooms.find((b) => b.id === ca.bathroom_id)?.name,
      }))
    }

    console.log("[v0] No matching query handler for:", sql)
    return []
  }

  async execute(sql: string, params: any[] = []): Promise<{ insertId?: number; affectedRows?: number }> {
    console.log("[v0] Database execute:", sql, params)

    const sqlLower = sql.toLowerCase().trim()

    if (sqlLower.includes("insert into users")) {
      const newId = this.users.length + 1
      const newUser = {
        id: newId,
        email: params[0],
        password_hash: params[1],
        full_name: params[2],
        role: params[3],
      }
      this.users.push(newUser)
      console.log("[v0] Created new user:", newUser)
      return { insertId: newId, affectedRows: 1 }
    }

    if (sqlLower.includes("insert into cleaning_activities")) {
      const newId = this.cleaningActivities.length + 1
      const newActivity = {
        id: newId,
        user_id: params[0],
        bathroom_id: params[1],
        cleaned_at: new Date(),
        toilets_cleaned: params[2] || false,
        sinks_cleaned: params[3] || false,
        mirrors_cleaned: params[4] || false,
        walls_cleaned: params[5] || false,
        floors_cleaned: params[6] || false,
        doors_cleaned: params[7] || false,
        toilet_paper_restocked: params[8] || false,
        paper_towels_restocked: params[9] || false,
        soap_restocked: params[10] || false,
        evidence_url: params[11] || null,
        evidence_type: params[12] || null,
        notes: params[13] || null,
      }
      this.cleaningActivities.push(newActivity)
      return { insertId: newId, affectedRows: 1 }
    }

    if (sqlLower.includes("insert into incidents")) {
      const newId = this.incidents.length + 1
      const newIncident = {
        id: newId,
        user_id: params[0],
        bathroom_id: params[1],
        title: params[2],
        description: params[3],
        evidence_url: params[4] || null,
        evidence_type: params[5] || null,
        status: "reported",
        priority: params[6] || "medium",
        reported_at: new Date(),
      }
      this.incidents.push(newIncident)
      return { insertId: newId, affectedRows: 1 }
    }

    console.log("[v0] No matching execute handler for:", sql)
    return { affectedRows: 0 }
  }
}

export const db: DatabaseConnection = new MockDatabase()
