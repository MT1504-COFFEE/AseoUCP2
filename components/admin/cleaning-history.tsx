"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react" // Añade useMemo
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
import { CheckCircle, Calendar, MapPin, User, Eye, ImageIcon, Video, Loader2, ListChecks, Droplet } from "lucide-react" // Añadidos iconos para métricas
import { format, parseISO, differenceInDays, startOfDay } from "date-fns" // Añade parseISO, differenceInDays, startOfDay
import { es } from "date-fns/locale"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

// Interfaz que coincide con CleaningActivityDto del backend
interface CleaningActivityDto {
  id: number;
  createdAt: string; // Fecha registro (ISO String)
  observations: string | null;
  userId: number | null;
  userName: string | null;
  bathroomId: number | null;
  bathroomName: string | null;
  buildingName: string | null;
  // floorName?: string | null;
  areasCleanedNames: string[];
  suppliesRefilledNames: string[];
  photos: string[];
}

export function CleaningHistory() {
  const [activities, setActivities] = useState<CleaningActivityDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
     if (user && user.role === 'admin') {
        fetchActivities();
    } else if (user && user.role !== 'admin') {
         setError("Acceso denegado.");
         setIsLoading(false);
    } else {
         setIsLoading(false);
         // setError("Necesitas iniciar sesión como administrador.");
    }
  }, [user])

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getCleaningActivities();
      console.log("Actividades recibidas del backend:", data);
      setActivities(data || []);
    } catch (err) {
      console.error("Error fetching cleaning activities:", err);
      setError(err instanceof Error ? err.message : "Error al cargar el historial de limpieza.");
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }

  // --- REINCORPORACIÓN DE MÉTRICAS ---
  const stats = useMemo(() => {
    if (!activities || activities.length === 0) {
      return { total: 0, today: 0, avgAreas: 0, avgSupplies: 0 };
    }
    const today = startOfDay(new Date());
    let totalAreas = 0;
    let totalSupplies = 0;
    let countToday = 0;

    activities.forEach(act => {
      totalAreas += act.areasCleanedNames.length;
      totalSupplies += act.suppliesRefilledNames.length;
      // Compara la fecha de la actividad con hoy
      try {
        if (differenceInDays(today, startOfDay(parseISO(act.createdAt))) === 0) {
            countToday++;
        }
      } catch (e) {
         console.error("Error parsing date for stats:", act.createdAt, e); // Manejo de error si la fecha sigue inválida
      }

    });

    return {
      total: activities.length,
      today: countToday,
      avgAreas: parseFloat((totalAreas / activities.length).toFixed(1)) || 0, // Evita NaN
      avgSupplies: parseFloat((totalSupplies / activities.length).toFixed(1)) || 0, // Evita NaN
    };
  }, [activities]); // Recalcula solo si 'activities' cambia
  // ------------------------------------


 // --- Renderizado ---
  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Cargando Historial...</CardTitle></CardHeader>
        <CardContent><div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div></CardContent>
      </Card>
    );
  }

   if (error) {
     return (
        <Card>
            <CardHeader><CardTitle className="text-destructive">Error</CardTitle></CardHeader>
            <CardContent><Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert></CardContent>
        </Card>
     );
   }


  return (
    <div className="space-y-6"> {/* Envuelve todo en un div con espacio */}
      {/* --- MOSTRAR MÉTRICAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Actividades Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-sm text-muted-foreground">Actividades Hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{stats.avgAreas}</div>
              <p className="text-sm text-muted-foreground">Áreas Prom./Act.</p>
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardContent className="p-4 flex items-center gap-2">
             <Droplet className="h-6 w-6 text-green-500" />
             <div>
                <div className="text-2xl font-bold">{stats.avgSupplies}</div>
                <p className="text-sm text-muted-foreground">Sum. Prom./Act.</p>
             </div>
          </CardContent>
        </Card>
      </div>
      {/* ------------------------- */}

      <Card> {/* Mantiene el Card para la lista */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Historial de Limpieza
          </CardTitle>
          <CardDescription>Registro de todas las actividades de limpieza realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay actividades de limpieza registradas</div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2 overflow-hidden"> {/* Added overflow-hidden */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">Limpieza #{activity.id}</h3> {/* Added truncate */}
                        <Badge variant="secondary">{activity.areasCleanedNames.length} áreas</Badge>
                        {activity.suppliesRefilledNames.length > 0 && (
                          <Badge variant="outline">{activity.suppliesRefilledNames.length} sum.</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 shrink-0"/> {/* Added shrink-0 */}
                           <span className="truncate">{activity.buildingName || '?'} - {activity.bathroomName || '?'}</span> {/* Added truncate */}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 shrink-0"/> {/* Added shrink-0 */}
                          <span className="truncate">{activity.userName || '?'}</span> {/* Added truncate */}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 shrink-0"/> {/* Added shrink-0 */}
                          {/* --- CORRECCIÓN FECHA: Usa parseISO --- */}
                          <span>
                            {activity.createdAt
                              ? format(parseISO(activity.createdAt), "dd/MM/yyyy HH:mm", { locale: es })
                              : 'Fecha inválida'}
                          </span>
                          {/* ------------------------------------- */}
                        </div>
                      </div>

                      {activity.observations && <p className="text-sm text-muted-foreground line-clamp-2">{activity.observations}</p>}
                    </div>

                    {/* --- Diálogo de Detalles (sin cambios mayores) --- */}
                    <Dialog>
                      <DialogTrigger asChild>
                         <Button variant="outline" size="sm" className="shrink-0"> {/* Added shrink-0 */}
                           <Eye className="h-4 w-4 mr-1 sm:mr-2" /> {/* Adjusted margin */}
                           <span className="hidden sm:inline">Ver Detalles</span> {/* Hide text on small screens */}
                         </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Actividad de Limpieza #{activity.id}</DialogTitle>
                          <DialogDescription>
                            {/* --- CORRECCIÓN FECHA: Usa parseISO --- */}
                            {activity.createdAt
                              ? format(parseISO(activity.createdAt), "dd/MM/yyyy HH:mm", { locale: es })
                              : 'Fecha inválida'}
                            {/* ------------------------------------- */}
                          </DialogDescription>
                        </DialogHeader>

                        {/* Contenido del Diálogo ... (igual que antes, usa los campos del DTO) */}
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"> {/* Added scroll */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Ubicación</Label>
                              <p className="text-sm text-muted-foreground">
                                {activity.buildingName || '?'} - {/* activity.floorName ? `${activity.floorName} - ` : '' */} {activity.bathroomName || '?'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Personal</Label>
                              <p className="text-sm text-muted-foreground">{activity.userName || '?'}</p>
                            </div>
                          </div>

                          {activity.areasCleanedNames.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Áreas Limpiadas</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {activity.areasCleanedNames.map((area) => (
                                  <Badge key={area} variant="secondary">{area}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {activity.suppliesRefilledNames.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Suministros Reabastecidos</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {activity.suppliesRefilledNames.map((supply) => (
                                  <Badge key={supply} variant="outline">{supply}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {activity.observations && (
                            <div>
                              <Label className="text-sm font-medium">Notas</Label>
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{activity.observations}</p> {/* Added whitespace */}
                            </div>
                          )}

                          {activity.photos && activity.photos.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium flex items-center gap-2">Evidencia(s)</Label>
                              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {activity.photos.map((url, index) => {
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
                    {/* --- Fin Diálogo --- */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div> // Cierre del div principal
  );
}

// Ya no necesitas la función Label local si la importas