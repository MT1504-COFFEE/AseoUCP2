"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label";
import { AlertTriangle, Calendar, MapPin, User, Eye, ImageIcon, Video, Loader2 } from "lucide-react"
import { format, parseISO, differenceInDays, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

// Interfaz que coincide con IncidentDto del backend
interface IncidentDto {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string; // Recibido como string ISO 8601
  resolvedAt: string | null; // Recibido como string ISO 8601
  bathroomId: number | null;
  bathroomName: string | null;
  buildingName: string | null;
  floorName: string | null;
  reportedById: number | null;
  reportedByName: string | null;
  photos: string[];
}

// Tipos explícitos para claves de mapeo
type Priority = IncidentDto['priority'];
type Status = IncidentDto['status'];

// --- CORRECCIÓN: Clases de color para los Badges ---
// Estas clases se aplicarán sobre la variante "outline"
const priorityColors: Record<Priority, string> = {
  high: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700", // Amarillo/Naranja
  low: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700",
};

const statusColors: Record<Status, string> = {
  pending: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-700", // Naranja
  in_progress: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700", // Azul
  resolved: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700", // Verde
};
// ------------------------------------------

// Mapeos de etiquetas
const priorityLabels: Record<Priority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const statusLabels: Record<Status, string> = {
  pending: "Pendiente",
  in_progress: "En Progreso",
  resolved: "Resuelto",
};

export function IncidentsDashboard() {
  
  // Hooks (useState, useAuth, useMemo, useEffect)
  const [incidents, setIncidents] = useState<IncidentDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();

  const stats = useMemo(() => {
    if (!incidents || incidents.length === 0) {
       return { total: 0, pending: 0, inProgress: 0, resolved: 0, high: 0 };
    }
    return {
      total: incidents.length,
      pending: incidents.filter((i) => i.status === "pending").length,
      inProgress: incidents.filter((i) => i.status === "in_progress").length,
      resolved: incidents.filter((i) => i.status === "resolved").length,
      high: incidents.filter((i) => i.priority === "high").length,
    };
  }, [incidents]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (user && user.role === 'admin') {
        fetchIncidents();
    } else if (user && user.role !== 'admin') {
         setError("Acceso denegado.");
         setIsLoading(false);
    } else if (!user) {
         setError("Necesitas iniciar sesión como administrador.");
         setIsLoading(false);
    }
  }, [user, isAuthLoading])

  // Función para obtener los incidentes
  const fetchIncidents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getIncidents();
      setIncidents(data || []);
    } catch (err) {
      console.error("Error fetching incidents:", err);
      const apiError = err instanceof Error ? err.message : "Error desconocido";
      const errorDetailMatch = apiError.match(/\{"error":"(.*?)"\}/);
      setError(errorDetailMatch ? errorDetailMatch[1] : apiError);
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Renderizados condicionales (isLoading, error)
  if (isLoading || isAuthLoading) { 
    return (
      <Card>
        <CardHeader><CardTitle>Cargando Incidentes...</CardTitle></CardHeader>
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
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
        </Card>
     );
   }

  // Renderizado principal
  return (
    <div className="space-y-6">
      {/* Stats Cards (Métricas de Incidentes) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.total}</div><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</div><p className="text-sm text-muted-foreground">Pendientes</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div><p className="text-sm text-muted-foreground">En Progreso</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</div><p className="text-sm text-muted-foreground">Resueltos</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.high}</div><p className="text-sm text-muted-foreground">Alta Prioridad</p></CardContent></Card>
      </div>

      {/* Lista de Incidentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Incidentes Reportados
          </CardTitle>
          <CardDescription>Lista de todos los incidentes reportados</CardDescription>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay incidentes reportados</div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                 <div key={incident.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{incident.title}</h3>
                        {/* --- CORRECCIÓN: Añade variant="outline" --- */}
                        <Badge variant="outline" className={priorityColors[incident.priority]}>
                          {priorityLabels[incident.priority]}
                        </Badge>
                        <Badge variant="outline" className={statusColors[incident.status]}>
                          {statusLabels[incident.status]}
                        </Badge>
                        {/* ------------------------------------------- */}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">{incident.buildingName || 'Edif.?'} - {incident.bathroomName || 'Baño?'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 shrink-0" />
                          <span className="truncate">{incident.reportedByName || 'Usuario?'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 shrink-0"/>
                          <span>
                            {incident.createdAt
                              ? format(parseISO(incident.createdAt), "dd/MM/yyyy HH:mm", { locale: es })
                              : 'Fecha inválida'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{incident.description || 'Sin descripción'}</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                         <Button variant="outline" size="sm" className="shrink-0">
                           <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                           <span className="hidden sm:inline">Ver Detalles</span>
                         </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{incident.title}</DialogTitle>
                          <DialogDescription>
                            Incidente #{incident.id} - {statusLabels[incident.status]}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Ubicación</Label>
                              <p className="text-sm text-muted-foreground">
                                {incident.buildingName || '?'} - {incident.floorName || '?'} - {incident.bathroomName || '?'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Reportado por</Label>
                              <p className="text-sm text-muted-foreground">{incident.reportedByName || '?'}</p>
                            </div>
                             <div>
                              <Label className="text-sm font-medium">Prioridad</Label>
                              {/* --- CORRECCIÓN: Añade variant="outline" --- */}
                              <Badge variant="outline" className={priorityColors[incident.priority]}>
                                {priorityLabels[incident.priority]}
                              </Badge>
                              {/* ------------------------------------------- */}
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Fecha Reporte</Label>
                              <p className="text-sm text-muted-foreground">
                                {incident.createdAt
                                  ? format(parseISO(incident.createdAt), "dd/MM/yyyy HH:mm", { locale: es })
                                  : 'Fecha inválida'}
                              </p>
                            </div>
                             {incident.resolvedAt && (
                                <div>
                                  <Label className="text-sm font-medium">Fecha Resolución</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {format(parseISO(incident.resolvedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                                  </p>
                                </div>
                             )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Descripción</Label>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{incident.description || 'N/A'}</p>
                          </div>
                          {incident.photos && incident.photos.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium flex items-center gap-2">Evidencia(s)</Label>
                               <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {incident.photos.map((url, index) => {
                                    const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
                                    return (
                                        <div key={index}>
                                            {isVideo ? (
                                                <video src={url} controls className="max-w-full h-auto rounded-lg aspect-video object-cover"/>
                                            ) : (
                                                <a href={url} target="_blank" rel="noopener noreferrer">
                                                    <img src={url || "/placeholder.jpg"} alt={`Evidencia ${index + 1}`} className="max-w-full h-auto rounded-lg aspect-square object-cover hover:opacity-80 transition-opacity"/>
                                                </a>
                                            )}
                                        </div>
                                    );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}