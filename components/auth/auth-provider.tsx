//MANEJO DE AUTENTICACIÓN Y CONTEXTO DE USUARIO

"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
// 1. IMPORTAMOS la interface User desde su único lugar de origen
import { saveAuthToken, saveUser, getUser, removeAuthToken, removeUser, type User } from "@/lib/auth"

// 2. Ya no necesitamos declarar la interface aquí

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getUser()
    if (storedUser) {
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await apiClient.login(email, password)

    // 3. Ahora TypeScript sabe exactamente cómo debe ser el objeto 'user'
    const loggedInUser: User = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName, // Usamos fullName
        role: data.user.role
    };

    saveAuthToken(data.token)
    saveUser(loggedInUser)
    setUser(loggedInUser)

    if (loggedInUser.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/staff")
    }
  }

  const logout = () => {
    removeAuthToken()
    removeUser()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}