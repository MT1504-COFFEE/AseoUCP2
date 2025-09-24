export interface User {
  id: number
  email: string
  full_name: string
  role: "cleaning_staff" | "admin"
}

export function saveAuthToken(token: string): void {
  localStorage.setItem("auth_token", token)
}

export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token")
}

export function removeAuthToken(): void {
  localStorage.removeItem("auth_token")
}

export function saveUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user))
}

export function getUser(): User | null {
  const userStr = localStorage.getItem("user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function removeUser(): void {
  localStorage.removeItem("user")
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null && getUser() !== null
}

export function logout(): void {
  removeAuthToken()
  removeUser()
}
