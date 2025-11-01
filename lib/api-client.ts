export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // Add JWT token if available
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      } else {
        return {} as T
      }
    } catch (error) {
      console.error("API Request failed:", error)
      throw error
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: { fullName: string; email: string; password: string; role: string }) {
    return this.request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser() {
    return this.request<any>("/auth/me")
  }

  async logout() {
    return this.request<any>("/auth/logout", {
      method: "POST",
    })
  }

  // Cleaning activities endpoints
  async getCleaningActivities() {
    return this.request<any[]>("/cleaning-activities")
  }

  async createCleaningActivity(activity: any) {
    return this.request<any>("/cleaning-activities", {
      method: "POST",
      body: JSON.stringify(activity),
    })
  }

  async updateIncidentStatus(id: number, status: "pending" | "in_progress" | "resolved", assignedUserId?: number | null) {
    
    // Construye el cuerpo de la petición
    const body: { status: string; assignedUserId?: number | null } = { status: status };
    
    // Añadimos el ID solo si se proporciona
    if (assignedUserId) {
      body.assignedUserId = assignedUserId;
    }

    return this.request<any>(`/incidents/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(body), // Envía {"status": "valor", "assignedUserId": 123}
    });
  }

  async updateCleaningActivity(id: number, activity: any) {
    return this.request<any>(`/cleaning-activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(activity),
    })
  }

  async deleteCleaningActivity(id: number) {
    return this.request<any>(`/cleaning-activities/${id}`, {
      method: "DELETE",
    })
  }

  // Incidents endpoints
  async getIncidents() {
    return this.request<any[]>("/incidents")
  }

  async createIncident(incident: any) {
    return this.request<any>("/incidents", {
      method: "POST",
      body: JSON.stringify(incident),
    })
  }

  async updateIncident(id: number, incident: any) {
    return this.request<any>(`/incidents/${id}`, {
      method: "PUT",
      body: JSON.stringify(incident),
    })
  }

  async deleteIncident(id: number) {
    return this.request<any>(`/incidents/${id}`, {
      method: "DELETE",
    })
  }

  // Bathrooms endpoints
  async getBathrooms() {
    return this.request<any[]>("/bathrooms")
  }

  async createBathroom(bathroom: any) {
    return this.request<any>("/bathrooms", {
      method: "POST",
      body: JSON.stringify(bathroom),
    })
  }

  async updateBathroom(id: number, bathroom: any) {
    return this.request<any>(`/bathrooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(bathroom),
    })
  }

  async deleteBathroom(id: number) {
    return this.request<any>(`/bathrooms/${id}`, {
      method: "DELETE",
    })
  }

  // Buildings endpoints
  async getBuildings() {
    return this.request<any[]>("/buildings")
  }

  async createBuilding(building: any) {
    return this.request<any>("/buildings", {
      method: "POST",
      body: JSON.stringify(building),
    })
  }

  // Floors endpoints
  async getFloors(buildingId?: number) {
    const endpoint = buildingId ? `/floors?buildingId=${buildingId}` : "/floors"
    return this.request<any[]>(endpoint)
  }

  async createFloor(floor: any) {
    return this.request<any>("/floors", {
      method: "POST",
      body: JSON.stringify(floor),
    })
  }

  // Users endpoints (for admin)
  async getUsers() {
    return this.request<any[]>("/users")
  }

  async createUser(user: any) {
    return this.request<any>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    })
  }

  async updateUser(id: number, user: any) {
    return this.request<any>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    })
  }

  async deleteUser(id: number) {
    return this.request<any>(`/users/${id}`, {
      method: "DELETE",
    })
  }

  // File upload endpoint
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    return this.request<{ url: string; type: string; filename: string; size: number }>("/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  }
}

export const apiClient = new ApiClient()
