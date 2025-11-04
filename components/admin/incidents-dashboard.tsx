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
  DialogFooter, 
  DialogClose,  
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" 
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" 
import { AlertTriangle, Calendar, MapPin, User, Eye, ImageIcon, Video, Loader2, History, CheckCircle, ArrowRight, UserCheck } from "lucide-react" 
import { parseISO } from "date-fns" 
import { format } from "date-fns-tz" // Importa format de date-fns-tz
import { es } from "date-fns/locale"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { User as AuthUser } from "@/lib/auth" 

// 1. Interfaz de Incidente actualizada
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
  assignedToId: number | null; // <-- NUEVO
  assignedToName: string | null; // <-- NUEVO
}

// Interfaz para usuarios (colaboradores)
type StaffUser = AuthUser;

type Priority = IncidentDto['priority'];
type Status = IncidentDto['status'];

// Mapeos (sin cambios)
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
const priorityLabels: Record<Priority, string> = { low: "Baja", medium: "Media", high: "Alta" };
const statusLabels: Record<Status, string> = { pending: "Pendiente", in_progress: "En Progreso", resolved: "Resuelto" };


export function IncidentsDashboard() {
  
  const [incidents, setIncidents] = useState<IncidentDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();
  
  // --- 2. NUEVOS ESTADOS ---
  const [staffList, setStaffList] = useState<StaffUser[]>([]); 
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false); 
  const [incidentToAssign, setIncidentToAssign] = useState<IncidentDto | null>(null); 
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null); 
  const [isAssigning, setIsAssigning] = useState(false); 
  
  const [updatingId, setUpdatingId] = useState<number | null>(null); // Para el botón "Resolver"

  // Stats (sin cambios)
  const stats = useMemo(() => {
    if (!incidents) return { total: 0, pending: 0, inProgress: 0, resolved: 0, high: 0 };
    return {
      total: incidents.length,
      pending: incidents.filter((i) => i.status === "pending").length,
      inProgress: incidents.filter((i) => i.status === "in_progress").length,
      resolved: incidents.filter((i) => i.status === "resolved").length,
      high: incidents.filter((i) => i.priority === "high").length,
    };
  }, [incidents]);

  // --- 3. USEEFFECT ACTUALIZADO ---
  useEffect(() => {
    if (isAuthLoading) return;
    if (user && user.role === 'admin') {
        fetchIncidents();
        fetchStaff(); // Cargar también el personal
    } else if (user && user.role !== 'admin') {
         setError("Acceso denegado.");
         setIsLoading(false);
    } else if (!user) {
         setError("Necesitas iniciar sesión como administrador.");
         setIsLoading(false);
    }
  }, [user, isAuthLoading])

  const fetchIncidents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getIncidents(); //
      setIncidents(data || []);
    } catch (err) {
      console.error("Error fetching incidents:", err);
      const apiError = err instanceof Error ? err.message : "Error desconocido";
      setError(apiError);
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  }

  // --- 4. NUEVA FUNCIÓN: OBTENER PERSONAL ---
  const fetchStaff = async () => {
    try {
      const users = await apiClient.getUsers(); //
      const staff = users.filter((u: StaffUser) => u.role === 'cleaning_staff');
      setStaffList(staff || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
      toast.error("No se pudo cargar la lista del personal.");
    }
  }

  // --- 5. FUNCIONES PARA CONTROLAR EL MODAL ---
  const handleOpenAssignModal = (incident: IncidentDto) => {
    setIncidentToAssign(incident);
    setSelectedStaffId(null); 
    setIsAssignModalOpen(true);
  }

  const handleCloseAssignModal = () => {
    if (isAssigning) return; 
    setIsAssignModalOpen(false);
    setIncidentToAssign(null);
    setSelectedStaffId(null);
  }

  // --- 6. FUNCIÓN DE ASIGNACIÓN ---
  const handleAssignIncident = async () => {
    if (!incidentToAssign || !selectedStaffId) {
      toast.error("Por favor, selecciona un colaborador.");
      return;
    }

    setIsAssigning(true);
    try {
      const incidentId = incidentToAssign.id;
      const staffId = Number(selectedStaffId);
      
      const updatedIncident: IncidentDto = await apiClient.updateIncidentStatus( //
        incidentId, 
        'in_progress', 
        staffId
      );
        
      setIncidents((currentIncidents) => 
        currentIncidents.map(incident => 
          incident.id === incidentId ? updatedIncident : incident
        )
      );

      toast.success(`Incidente #${incidentId} asignado.`);
      handleCloseAssignModal();
    } catch (err) {
        console.error("Error assigning incident:", err);
        toast.error("Error al asignar el incidente.");
    } finally {
        setIsAssigning(false);
    }
  }
  
  // --- 7. FUNCIÓN PARA RESOLVER ---
  const handleResolveIncident = async (incidentId: number) => {
    setUpdatingId(incidentId); 
    try {
        const updatedIncident: IncidentDto = await apiClient.updateIncidentStatus( //
          incidentId, 
          'resolved',
          null // No enviamos assignedUserId al resolver
        );
        
        setIncidents((currentIncidents) => 
          currentIncidents.map(incident => 
            incident.id === incidentId ? updatedIncident : incident
          )
        );

        toast.success(`Incidente #${incidentId} marcado como resuelto.`);
    } catch (err) {
        console.error("Error resolving incident:", err);
        toast.error("Error al resolver el incidente.");
    } finally {
        setUpdatingId(null);
    }
  }

  // --- Renderizados condicionales (sin cambios) ---
  if (isLoading || isAuthLoading) { 
    return (
      <Card>
        <CardHeader><CardTitle>Cargando Incidentes...</CardTitle></CardHeader>
        <CardContent><div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div></CardContent>
      </Card>
    );
  }
   if (error && !error.includes("actualizar")) {
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

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="space-y-6">
      {/* Stats Cards (sin cambios) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.total}</div><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</div><p className="text-sm text-muted-foreground">Pendientes</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div><p className="text-sm text-muted-foreground">En Progreso</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</div><p className="text-sm text-muted-foreground">Resueltos</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.high}</div><p className="text-sm text-muted-foreground">Alta Prioridad</p></CardContent></Card>
      </div>

      {/* Pestañas (sin cambios en estructura) */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
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

        {/* --- 8. ACTUALIZAR TabsContent (pasando las nuevas props) --- */}
        <TabsContent value="pending">
          <Card>
            <CardHeader><CardTitle>Incidentes Pendientes</CardTitle></CardHeader>
            <CardContent>
              <IncidentList 
                incidents={incidents.filter(i => i.status === 'pending')} 
                currentStatus="pending"
                updatingId={updatingId} 
                onOpenAssignModal={handleOpenAssignModal} 
                onResolveIncident={handleResolveIncident} 
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
                onOpenAssignModal={handleOpenAssignModal}
                onResolveIncident={handleResolveIncident} 
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
                onOpenAssignModal={handleOpenAssignModal}
                onResolveIncident={handleResolveIncident}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- 9. AÑADIR EL MODAL DE ASIGNACIÓN --- */}
      <Dialog open={isAssignModalOpen} onOpenChange={handleCloseAssignModal}>
        <DialogContent onInteractOutside={(e) => { if (isAssigning) e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle>Asignar Incidente</DialogTitle>
            <DialogDescription>
              Selecciona un colaborador del personal de limpieza para atender esta incidencia.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Incidente</Label>
              <p className="text-sm font-medium p-3 bg-muted rounded-md">{incidentToAssign?.title}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-select">Asignar a</Label>
              <Select 
                value={selectedStaffId || undefined} 
                onValueChange={setSelectedStaffId}
                disabled={isAssigning}
              >
                <SelectTrigger id="staff-select">
                  <SelectValue placeholder="Selecciona un colaborador..." />
                </SelectTrigger>
                <SelectContent>
                  {staffList.length > 0 ? (
                    staffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.fullName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>Cargando personal...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAssignModal} disabled={isAssigning}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAssignIncident} 
              disabled={isAssigning || !selectedStaffId}
            >
              {isAssigning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Confirmar Asignación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- 10. ACTUALIZAR `IncidentList` ---
interface IncidentListProps {
  incidents: IncidentDto[];
  currentStatus: Status; 
  updatingId: number | null; 
  onOpenAssignModal: (incident: IncidentDto) => void; 
  onResolveIncident: (id: number) => void; 
}

function IncidentList({ incidents, currentStatus, updatingId, onOpenAssignModal, onResolveIncident }: IncidentListProps) {
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
        const isUpdating = updatingId === incident.id;

        return (
          <div key={incident.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between gap-4">
              {/* Detalles principales del incidente */}
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
                            ? format(parseISO(incident.createdAt), "dd/MM/yyyy HH:mm", {timeZone: "America/Bogota" })
                            : 'Fecha inválida'}
                        </span>
                    </div>
                </div>
                
                {/* --- Mostrar Asignado (NUEVO) --- */}
                {incident.assignedToName && (
                  <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium">
                      <UserCheck className="h-4 w-4 shrink-0" />
                      <span>Asignado a: {incident.assignedToName}</span>
                  </div>
                )}

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
                              <Badge variant="outline" className={cn(priorityColors[incident.priority])}>
                                {priorityLabels[incident.priority]}
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Fecha Reporte</Label>
                              <p className="text-sm text-muted-foreground">
                                {incident.createdAt
                                  ? format(parseISO(incident.createdAt), "dd/MM/yyyy HH:mm", { locale: es, timeZone: "America/Bogota" })
                                  : 'Fecha inválida'}
                              </p>
                            </div>
                              
                              {/* --- Mostrar Asignado (NUEVO) --- */}
                              {incident.assignedToName && (
                                <div>
                                  <Label className="text-sm font-medium">Asignado a</Label>
                                  <p className="text-sm text-muted-foreground">{incident.assignedToName}</p>
                                </div>
                              )}

                              {incident.resolvedAt && (
                                <div>
                                  <Label className="text-sm font-medium">Fecha Resolución</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {format(parseISO(incident.resolvedAt), "dd/MM/yyyy HH:mm", { locale: es, timeZone: "America/Bogota" })}
                                  </p>
                                </div>
                              )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Descripción</Label>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{incident.description || 'N/A'}</p>
                          </div>
                          {/* Evidencia (sin cambios) */}
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

                {/* --- BOTONES DE CAMBIO DE ESTADO (ACTUALIZADOS) --- */}
                {currentStatus === 'pending' && (
                  <Button 
                    size="sm" 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    onClick={() => onOpenAssignModal(incident)} // <-- ESTE ES EL CAMBIO
                  >
                    {/* El texto del botón ahora es "Asignar Tarea" */}
                    <span className="hidden sm:inline">Asignar Tarea</span>
                    <span className="sm:hidden">Asignar</span>
                    <ArrowRight className="h-4 w-4 ml-1 sm:ml-2" />
                  </Button>
                )}

                {currentStatus === 'in_progress' && (
                  <Button 
                    size="sm" 
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    disabled={isUpdating}
                    onClick={() => onResolveIncident(incident.id)} // Llama a la nueva función de resolver
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