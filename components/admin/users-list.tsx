"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Users, Shield, UserCheck, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth/auth-provider"
import type { User } from "@/lib/auth" 
import { toast } from "sonner" 

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user: adminUser } = useAuth()

  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (adminUser && adminUser.role === 'admin') {
      fetchUsers()
    }
  }, [adminUser])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient.getUsers()
      if (Array.isArray(data)) {
         setUsers(data)
      } else {
         console.error("La respuesta de /api/users no fue un array:", data);
         setUsers([]); 
         setError("La respuesta del servidor para obtener usuarios no fue válida.");
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los colaboradores.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsAlertOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    if (adminUser?.id === userToDelete.id) {
        toast.error("No puedes eliminar tu propia cuenta.");
        setIsAlertOpen(false);
        return;
    }

    setIsDeleting(true);
    try {
      await apiClient.deleteUser(userToDelete.id); //
      toast.success(`Usuario "${userToDelete.fullName}" eliminado.`);
      setUsers(currentUsers => currentUsers.filter(u => u.id !== userToDelete.id));
    } catch (err) {
      console.error("Error deleting user:", err);
      const apiError = err instanceof Error ? err.message : "Error desconocido";
      const errorDetailMatch = apiError.match(/\{"error":"(.*?)"\}/);
      toast.error(errorDetailMatch ? errorDetailMatch[1] : apiError);
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
      setUserToDelete(null);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Cargando Colaboradores...</CardTitle></CardHeader>
        <CardContent><div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-destructive">Error</CardTitle></CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert> 
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de Colaboradores
          </CardTitle>
          <CardDescription>
            Lista de todo el personal registrado en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead> 
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === 'admin' ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <Shield className="h-3 w-3" />
                            Administrador
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <UserCheck className="h-3 w-3" />
                            Personal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(user)}
                          disabled={adminUser?.id === user.id} 
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario: 
              <span className="font-medium block mt-2">{userToDelete?.fullName}</span>
              <span className="text-xs text-muted-foreground">{userToDelete?.email}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}