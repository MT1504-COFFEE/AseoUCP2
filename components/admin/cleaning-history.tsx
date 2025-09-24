"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { CheckCircle, Calendar, MapPin, User, Eye, ImageIcon, Video } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface CleaningActivity {
  id: number
  cleaned_at: string
  full_name: string
  bathroom_name: string
  floor_name: string
  building_name: string
  toilets_cleaned: boolean
  sinks_cleaned: boolean
  mirrors_cleaned: boolean
  walls_cleaned: boolean
  floors_cleaned: boolean
  doors_cleaned: boolean
  toilet_paper_restocked: boolean
  paper_towels_restocked: boolean
  soap_restocked: boolean
  evidence_url?: string
  evidence_type?: "image" | "video"
  notes?: string
}

export function CleaningHistory() {
  const [activities, setActivities] = useState<CleaningActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/cleaning-activities")
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error("Error fetching cleaning activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Limpieza</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getAreasCleanedCount = (activity: CleaningActivity) => {
    const areas = [
      activity.toilets_cleaned,
      activity.sinks_cleaned,
      activity.mirrors_cleaned,
      activity.walls_cleaned,
      activity.floors_cleaned,
      activity.doors_cleaned,
    ]
    return areas.filter(Boolean).length
  }

  const getSuppliesRestockedCount = (activity: CleaningActivity) => {
    const supplies = [activity.toilet_paper_restocked, activity.paper_towels_restocked, activity.soap_restocked]
    return supplies.filter(Boolean).length
  }

  const getAreasCleanedList = (activity: CleaningActivity) => {
    const areas = []
    if (activity.toilets_cleaned) areas.push("Sanitarios")
    if (activity.sinks_cleaned) areas.push("Lavamanos")
    if (activity.mirrors_cleaned) areas.push("Espejos")
    if (activity.walls_cleaned) areas.push("Paredes")
    if (activity.floors_cleaned) areas.push("Pisos")
    if (activity.doors_cleaned) areas.push("Puertas")
    return areas
  }

  const getSuppliesRestockedList = (activity: CleaningActivity) => {
    const supplies = []
    if (activity.toilet_paper_restocked) supplies.push("Papel higiénico")
    if (activity.paper_towels_restocked) supplies.push("Toallas de papel")
    if (activity.soap_restocked) supplies.push("Jabón")
    return supplies
  }

  return (
    <Card>
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
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">Limpieza Completada</h3>
                      <Badge variant="secondary">{getAreasCleanedCount(activity)} áreas limpiadas</Badge>
                      {getSuppliesRestockedCount(activity) > 0 && (
                        <Badge variant="outline">{getSuppliesRestockedCount(activity)} suministros</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {activity.building_name} - {activity.bathroom_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {activity.full_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(activity.cleaned_at), "dd/MM/yyyy HH:mm", { locale: es })}
                      </div>
                    </div>

                    {activity.notes && <p className="text-sm text-muted-foreground line-clamp-2">{activity.notes}</p>}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Actividad de Limpieza</DialogTitle>
                        <DialogDescription>
                          Registro #{activity.id} -{" "}
                          {format(new Date(activity.cleaned_at), "dd/MM/yyyy HH:mm", { locale: es })}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Ubicación</Label>
                            <p className="text-sm text-muted-foreground">
                              {activity.building_name} - {activity.floor_name} - {activity.bathroom_name}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Personal</Label>
                            <p className="text-sm text-muted-foreground">{activity.full_name}</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Áreas Limpiadas</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {getAreasCleanedList(activity).map((area) => (
                              <Badge key={area} variant="secondary">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {getSuppliesRestockedList(activity).length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Suministros Reabastecidos</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {getSuppliesRestockedList(activity).map((supply) => (
                                <Badge key={supply} variant="outline">
                                  {supply}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {activity.notes && (
                          <div>
                            <Label className="text-sm font-medium">Notas</Label>
                            <p className="text-sm text-muted-foreground mt-1">{activity.notes}</p>
                          </div>
                        )}

                        {activity.evidence_url && (
                          <div>
                            <Label className="text-sm font-medium flex items-center gap-2">
                              {activity.evidence_type === "video" ? (
                                <Video className="h-4 w-4" />
                              ) : (
                                <ImageIcon className="h-4 w-4" />
                              )}
                              Evidencia
                            </Label>
                            <div className="mt-2">
                              {activity.evidence_type === "video" ? (
                                <video src={activity.evidence_url} controls className="max-w-full h-auto rounded-lg" />
                              ) : (
                                <img
                                  src={activity.evidence_url || "/placeholder.svg"}
                                  alt="Evidencia de limpieza"
                                  className="max-w-full h-auto rounded-lg"
                                />
                              )}
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
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
