import mysql from "mysql2/promise"

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  const [rows] = await pool.execute(text, params)
  const duration = Date.now() - start
  console.log("Executed query", { text, duration, rows: Array.isArray(rows) ? rows.length : 0 })
  return { rows }
}

export async function getConnection() {
  const connection = await pool.getConnection()
  return connection
}

// Database helper functions
export async function createUser(userData: {
  name: string
  email: string
  password: string
  role: "admin" | "staff"
}) {
  const { name, email, password, role } = userData
  const result = await query("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())", [
    name,
    email,
    password,
    role,
  ])

  const userId = (result.rows as any).insertId
  const userResult = await query("SELECT * FROM users WHERE id = ?", [userId])
  return (userResult.rows as any[])[0]
}

export async function getUserByEmail(email: string) {
  const result = await query("SELECT * FROM users WHERE email = ?", [email])
  return (result.rows as any[])[0]
}

export async function getUserById(id: number) {
  const result = await query("SELECT * FROM users WHERE id = ?", [id])
  return (result.rows as any[])[0]
}

export async function getBathrooms() {
  const result = await query("SELECT * FROM bathrooms ORDER BY name")
  return result.rows as any[]
}

export async function createBathroom(bathroomData: {
  name: string
  location: string
  floor: number
}) {
  const { name, location, floor } = bathroomData
  const result = await query("INSERT INTO bathrooms (name, location, floor, created_at) VALUES (?, ?, ?, NOW())", [
    name,
    location,
    floor,
  ])

  const bathroomId = (result.rows as any).insertId
  const bathroomResult = await query("SELECT * FROM bathrooms WHERE id = ?", [bathroomId])
  return (bathroomResult.rows as any[])[0]
}

export async function getCleaningActivities() {
  const result = await query(`
    SELECT ca.*, b.name as bathroom_name, u.name as staff_name 
    FROM cleaning_activities ca
    JOIN bathrooms b ON ca.bathroom_id = b.id
    JOIN users u ON ca.staff_id = u.id
    ORDER BY ca.created_at DESC
  `)
  return result.rows as any[]
}

export async function createCleaningActivity(activityData: {
  bathroom_id: number
  staff_id: number
  activity_type: string
  status: "pending" | "in_progress" | "completed"
  notes?: string
}) {
  const { bathroom_id, staff_id, activity_type, status, notes } = activityData
  const result = await query(
    "INSERT INTO cleaning_activities (bathroom_id, staff_id, activity_type, status, notes, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
    [bathroom_id, staff_id, activity_type, status, notes],
  )

  const activityId = (result.rows as any).insertId
  const activityResult = await query("SELECT * FROM cleaning_activities WHERE id = ?", [activityId])
  return (activityResult.rows as any[])[0]
}

export async function updateCleaningActivity(
  id: number,
  updates: {
    status?: "pending" | "in_progress" | "completed"
    notes?: string
    completed_at?: Date
  },
) {
  const fields = []
  const values = []

  if (updates.status) {
    fields.push("status = ?")
    values.push(updates.status)
  }

  if (updates.notes) {
    fields.push("notes = ?")
    values.push(updates.notes)
  }

  if (updates.completed_at) {
    fields.push("completed_at = ?")
    values.push(updates.completed_at)
  }

  if (fields.length === 0) return null

  values.push(id)
  const result = await query(`UPDATE cleaning_activities SET ${fields.join(", ")} WHERE id = ?`, values)

  const activityResult = await query("SELECT * FROM cleaning_activities WHERE id = ?", [id])
  return (activityResult.rows as any[])[0]
}

export async function getIncidents() {
  const result = await query(`
    SELECT i.*, b.name as bathroom_name, u.name as reported_by_name 
    FROM incidents i
    JOIN bathrooms b ON i.bathroom_id = b.id
    JOIN users u ON i.reported_by = u.id
    ORDER BY i.created_at DESC
  `)
  return result.rows as any[]
}

export async function createIncident(incidentData: {
  bathroom_id: number
  reported_by: number
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "open" | "in_progress" | "resolved"
}) {
  const { bathroom_id, reported_by, title, description, priority, status } = incidentData
  const result = await query(
    "INSERT INTO incidents (bathroom_id, reported_by, title, description, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
    [bathroom_id, reported_by, title, description, priority, status],
  )

  const incidentId = (result.rows as any).insertId
  const incidentResult = await query("SELECT * FROM incidents WHERE id = ?", [incidentId])
  return (incidentResult.rows as any[])[0]
}

export async function updateIncident(
  id: number,
  updates: {
    status?: "open" | "in_progress" | "resolved"
    priority?: "low" | "medium" | "high"
    resolved_at?: Date
  },
) {
  const fields = []
  const values = []

  if (updates.status) {
    fields.push("status = ?")
    values.push(updates.status)
  }

  if (updates.priority) {
    fields.push("priority = ?")
    values.push(updates.priority)
  }

  if (updates.resolved_at) {
    fields.push("resolved_at = ?")
    values.push(updates.resolved_at)
  }

  if (fields.length === 0) return null

  values.push(id)
  const result = await query(`UPDATE incidents SET ${fields.join(", ")} WHERE id = ?`, values)

  const incidentResult = await query("SELECT * FROM incidents WHERE id = ?", [id])
  return (incidentResult.rows as any[])[0]
}
