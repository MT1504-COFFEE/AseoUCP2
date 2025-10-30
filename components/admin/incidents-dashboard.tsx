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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" 
import { AlertTriangle, Calendar, MapPin, User, Eye, ImageIcon, Video, Loader2, History, CheckCircle, ArrowRight } from "lucide-react" // ArrowRight
import { format, parseISO, differenceInDays, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Importa toast para notificaciones

// Interfaz DTO (sin cambios)
interface IncidentDto {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  resolvedAt: string | null;
  bathroomId: number | null;
  bathroomName: string | null;
  buildingName: string | null;
  floorName: string | null;
  reportedById: number | null;
  reportedByName: string | null;
  photos: string[];
}

// Tipos explícitos
type Priority = IncidentDto['priority'];
type Status = IncidentDto['status'];

// --- CORRECCIÓN DE COLORES ---
const priorityColors: Record<Priority, string> = {
  high: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700",
  low: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700",
};
const statusColors: Record<Status, string> = {
  pending: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-700",
  in_progress: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700",
  resolved: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700",
};
// ---------------------------------

// Etiquetas
const priorityLabels: Record<Priority, string> = { low: "Baja", medium: "Media", high: "Alta" };
const statusLabels: Record<Status, string> = { pending: "Pendiente", in_progress: "En Progreso", resolved: "Resuelto" };


export function IncidentsDashboard() {
  
  // --- HOOKS ---
  const [incidents, setIncidents] = useState<IncidentDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();
  // Estado para el ID del incidente que se está actualizando
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Calcula las métricas
  const stats = useMemo(() => {
    // ... (código de stats como antes) ...
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

  // Carga los datos
  useEffect(() => {
    // ... (código useEffect como antes) ...
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
    } catch (err) { /* ... manejo de error ... */ }
    finally { setIsLoading(false); }
  }

  // --- NUEVA FUNCIÓN: Manejar cambio de estado ---
  const handleStatusChange = async (incidentId: number, newStatus: Status) => {
    setUpdatingId(incidentId); // Muestra spinner en el botón
    try {
        // Llama al nuevo método del apiClient
        const updatedIncident: IncidentDto = await apiClient.updateIncidentStatus(incidentId, newStatus);
        
        // Actualiza el estado local de 'incidents' para mover el item
        setIncidents(prevIncidents => 
            prevIncidents.map(inc => 
                inc.id === incidentId 
                    ? updatedIncident // Reemplaza el incidente antiguo por el actualizado
                    : inc
            )
        );
        toast.success(`Incidente #${incidentId} actualizado a "${statusLabels[newStatus]}"`);
    } catch (err) {
        console.error("Error updating incident status:", err);
        toast.error("Error al actualizar el incidente.");
        setError(err instanceof Error ? err.message : "Error al actualizar.");
    } finally {
        setUpdatingId(null); // Oculta spinner
    }
  }


  // --- Renderizados condicionales ---
  if (isLoading || isAuthLoading) { /* ... render cargando ... */ }
  if (error) { /* ... render error ... */ }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="space-y-6">
      {/* Stats Cards (Métricas) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* ... (las 5 cards de métricas como antes) ... */}
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.total}</div><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</div><p className="text-sm text-muted-foreground">Pendientes</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div><p className="text-sm text-muted-foreground">En Progreso</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</div><p className="text-sm text-muted-foreground">Resueltos</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.high}</div><p className="text-sm text-muted-foreground">Alta Prioridad</p></CardContent></Card>
      </div>

      {/* Pestañas para filtrar incidentes */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {/* ... (TabsTriggers como antes) ... */}
           <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pendientes ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            En Progreso ({stats.inProgress})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Resueltos ({stats.resolved})
          </TabsTrigger>
        </TabsList>

        {/* --- Pasa las props 'onStatusChange', 'updatingId' y 'status' a IncidentList --- */}
        <TabsContent value="pending">
          <Card>
            <CardHeader><CardTitle>Incidentes Pendientes</CardTitle></CardHeader>
            <CardContent>
              <IncidentList 
                incidents={incidents.filter(i => i.status === 'pending')} 
                currentStatus="pending"
                updatingId={updatingId}
                onStatusChange={handleStatusChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in_progress">
          <Card>
            <CardHeader><CardTitle>Incidentes En Progreso</CardTitle></CardHeader>
            <CardContent>
              <IncidentList 
                incidents={incidents.filter(i => i.status === 'in_progress')} 
                currentStatus="in_progress"
                updatingId={updatingId}
                onStatusChange={handleStatusChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          <Card>
            <CardHeader><CardTitle>Incidentes Resueltos</CardTitle></CardHeader>
            <CardContent>
              <IncidentList 
                incidents={incidents.filter(i => i.status === 'resolved')} 
                currentStatus="resolved"
                updatingId={updatingId}
                onStatusChange={handleStatusChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- COMPONENTE REUTILIZABLE `IncidentList` (MODIFICADO) ---
interface IncidentListProps {
  incidents: IncidentDto[];
  currentStatus: Status; // Para saber en qué pestaña estamos
  updatingId: number | null; // Para saber qué botón deshabilitar
  onStatusChange: (id: number, newStatus: Status) => void; // Función para llamar al cambiar
}

function IncidentList({ incidents, currentStatus, updatingId, onStatusChange }: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay incidentes en esta categoría.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => {
        const isUpdating = updatingId === incident.id; // Verifica si este incidente se está actualizando

        return (
          <div key={incident.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            {/* --- Envuelve el contenido y los botones en un flex --- */}
            <div className="flex items-center justify-between gap-4">
              {/* Contenido (ocupa el espacio disponible) */}
              <div className="flex-1 space-y-2 overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{incident.title}</h3>
                  <Badge variant="outline" className={cn(priorityColors[incident.priority])}>
                    {priorityLabels[incident.priority]}
                  </Badge>
                  <Badge variant="outline" className={cn(statusColors[incident.status])}>
                    {statusLabels[incident.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    {/* ... (MapPin, User, Calendar como antes) ... */}
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

              {/* Botones (alineados a la derecha) */}
              <div className="flex flex-col sm:flex-row gap-2 items-center shrink-0">
                <Dialog>
                  <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Ver Detalles</span>
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                      {/* ... (Contenido del modal como antes) ... */}
                  </DialogContent>
                </Dialog>

                {/* --- BOTÓN DE CAMBIO DE ESTADO --- */}
                {currentStatus === 'pending' && (
                  <Button 
                    size="sm" 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    disabled={isUpdating}
                    onClick={() => onStatusChange(incident.id, 'in_progress')}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span className="hidden sm:inline">Iniciar Progreso</span>
                        <span className="sm:hidden">Iniciar</span>
                        <ArrowRight className="h-4 w-4 ml-1 sm:ml-2" />
                      </>
                    )}
                  </Button>
                )}

                {currentStatus === 'in_progress' && (
                  <Button 
                    size="sm" 
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    disabled={isUpdating}
                    onClick={() => onStatusChange(incident.id, 'resolved')}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span className="hidden sm:inline">Marcar Resuelto</span>
                        <span className="sm:hidden">Resolver</span>
                        <CheckCircle className="h-4 w-4 ml-1 sm:ml-2" />
                      </>
                    )}
                  </Button>
                )}
                {/* No se muestra botón en la pestaña "Resuelto" */}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}

// Nota: Asegúrate de importar 'toast' de 'sonner'
// Si no lo tienes, añádelo a tu layout.tsx o donde manejes las notificaciones.