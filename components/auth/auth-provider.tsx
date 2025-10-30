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
  // --- AÑADE ESTA LÍNEA ---
  authenticate: (user: User, token: string) => void // Función para actualizar estado y redirigir
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

  // --- NUEVA FUNCIÓN CENTRALIZADA ---
  // Esta función maneja el guardado, la actualización del estado Y la redirección
  const authenticate = (user: User, token: string) => {
    saveAuthToken(token)
    saveUser(user)
    setUser(user) // <-- ¡EL PASO CLAVE! Actualiza el estado en memoria.

    // Redirige según el rol
    if (user.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/staff")
    }
  }
  // --- FIN DE LA NUEVA FUNCIÓN ---

  const login = async (email: string, password: string) => {
    const data = await apiClient.login(email, password)

    const loggedInUser: User = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName, // Usamos fullName
        role: data.user.role
    };

    // --- USA LA NUEVA FUNCIÓN ---
    // En lugar de repetir la lógica, llama a la función centralizada
    authenticate(loggedInUser, data.token)
  }

  const logout = () => {
    removeAuthToken()
    removeUser()
    setUser(null)
    router.push("/login")
  }

  return (
    // --- AÑADE 'authenticate' AL VALOR DEL PROVIDER ---
    <AuthContext.Provider value={{ user, isLoading, login, logout, authenticate }}>
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