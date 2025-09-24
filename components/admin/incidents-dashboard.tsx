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
import { AlertTriangle, Calendar, MapPin, User, Eye, ImageIcon, Video } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Incident {
  id: number
  title: string
  description: string
  status: "reported" | "in_progress" | "resolved"
  priority: "low" | "medium" | "high"
  reported_at: string
  full_name: string
  bathroom_name: string
  floor_name: string
  building_name: string
  evidence_url?: string
  evidence_type?: "image" | "video"
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
}

const statusColors = {
  reported: "bg-orange-100 text-orange-800 border-orange-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
}

const priorityLabels = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
}

const statusLabels = {
  reported: "Reportado",
  in_progress: "En Progreso",
  resolved: "Resuelto",
}

export function IncidentsDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    try {
      const response = await fetch("/api/incidents")
      const data = await response.json()
      setIncidents(data.incidents || [])
    } catch (error) {
      console.error("Error fetching incidents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Incidentes Reportados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stats = {
    total: incidents.length,
    reported: incidents.filter((i) => i.status === "reported").length,
    inProgress: incidents.filter((i) => i.status === "in_progress").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
    high: incidents.filter((i) => i.priority === "high").length,
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.reported}</div>
            <p className="text-sm text-muted-foreground">Reportados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-sm text-muted-foreground">En Progreso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-sm text-muted-foreground">Resueltos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.high}</div>
            <p className="text-sm text-muted-foreground">Alta Prioridad</p>
          </CardContent>
        </Card>
      </div>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Incidentes Reportados
          </CardTitle>
          <CardDescription>Lista de todos los incidentes reportados por el personal de limpieza</CardDescription>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay incidentes reportados</div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{incident.title}</h3>
                        <Badge className={priorityColors[incident.priority]}>{priorityLabels[incident.priority]}</Badge>
                        <Badge className={statusColors[incident.status]}>{statusLabels[incident.status]}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {incident.building_name} - {incident.bathroom_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {incident.full_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(incident.reported_at), "dd/MM/yyyy HH:mm", { locale: es })}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{incident.description}</p>
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
                          <DialogTitle>{incident.title}</DialogTitle>
                          <DialogDescription>
                            Incidente #{incident.id} - {statusLabels[incident.status]}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Ubicación</Label>
                              <p className="text-sm text-muted-foreground">
                                {incident.building_name} - {incident.floor_name} - {incident.bathroom_name}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Reportado por</Label>
                              <p className="text-sm text-muted-foreground">{incident.full_name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Prioridad</Label>
                              <Badge className={priorityColors[incident.priority]}>
                                {priorityLabels[incident.priority]}
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Fecha</Label>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(incident.reported_at), "dd/MM/yyyy HH:mm", { locale: es })}
                              </p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Descripción</Label>
                            <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
                          </div>

                          {incident.evidence_url && (
                            <div>
                              <Label className="text-sm font-medium flex items-center gap-2">
                                {incident.evidence_type === "video" ? (
                                  <Video className="h-4 w-4" />
                                ) : (
                                  <ImageIcon className="h-4 w-4" />
                                )}
                                Evidencia
                              </Label>
                              <div className="mt-2">
                                {incident.evidence_type === "video" ? (
                                  <video
                                    src={incident.evidence_url}
                                    controls
                                    className="max-w-full h-auto rounded-lg"
                                  />
                                ) : (
                                  <img
                                    src={incident.evidence_url || "/placeholder.svg"}
                                    alt="Evidencia del incidente"
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
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
