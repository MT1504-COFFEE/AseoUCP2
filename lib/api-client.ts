// Archivo: lib/api-client.ts
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

  // --- Endpoints de Autenticación (sin cambios) ---
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

  // --- Endpoints de Actividades (sin cambios) ---
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
    const body: { status: string; assignedUserId?: number | null } = { status: status };
    if (assignedUserId) {
      body.assignedUserId = assignedUserId;
    }
    return this.request<any>(`/incidents/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(body),
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

  // --- Endpoints de Incidentes (sin cambios) ---
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

  // --- Endpoints de Baños y otros (sin cambios) ---
  async getBathrooms() {
    return this.request<any[]>("/bathrooms")
  }
  // ... (otros endpoints de create/update/delete Bathroom) ...
  async getBuildings() {
    return this.request<any[]>("/buildings")
  }
  // ... (otros endpoints de create Building) ...
  async getFloors(buildingId?: number) {
    const endpoint = buildingId ? `/floors?buildingId=${buildingId}` : "/floors"
    return this.request<any[]>(endpoint)
  }
  // ... (otros endpoints de create Floor) ...

  // --- Endpoints de Usuarios (sin cambios) ---
  async getUsers() {
    return this.request<any[]>("/users")
  }
  // ... (createUser, updateUser) ...
  async deleteUser(id: number) {
    return this.request<any>(`/users/${id}`, {
      method: "DELETE",
    })
  }


  // --- SECCIÓN DE SUBIDA DE ARCHIVOS (MODIFICADA) ---

  // 1. uploadFile AHORA ACEPTA FormData
  // 2. EL TIPO DE RETORNO AHORA INCLUYE publicId
  async uploadFile(formData: FormData) {
    return this.request<{ url: string; publicId: string; type: string; filename: string; size: number }>("/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Deja que el navegador ponga el Content-Type para FormData
    })
  }

  // 3. NUEVO MÉTODO deleteFile
  async deleteFile(publicId: string) {
    return this.request<any>(`/upload/${publicId}`, {
      method: "DELETE",
    });
  }

  async forgotPassword(email: string) {
    return this.request<any>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }
  
  async resetPassword(token: string, newPassword: string) {
    return this.request<any>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }
}

export const apiClient = new ApiClient()