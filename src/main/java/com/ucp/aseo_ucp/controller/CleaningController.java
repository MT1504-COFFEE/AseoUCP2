package com.ucp.aseo_ucp.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api") // Todas las rutas empezarán con /api
@CrossOrigin(origins = "http://localhost:3000")
public class CleaningController {

    // --- Aquí iría la lógica de negocio (en @Services) ---

    @GetMapping("/bathrooms")
    public ResponseEntity<List<?>> getBathrooms() {
        System.out.println("Petición para obtener lista de baños.");
        // TODO: Implementar la lógica para devolver la lista de baños desde la BD.
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/cleaning-activities")
    public ResponseEntity<?> createActivity(@RequestBody Map<String, Object> activity) {
        System.out.println("Registrando actividad de limpieza: " + activity.toString());
        // TODO: Guardar la actividad en la base de datos.
        return ResponseEntity.ok(Map.of("message", "Actividad creada exitosamente"));
    }

    @GetMapping("/cleaning-activities")
    public ResponseEntity<List<?>> getActivities() {
        System.out.println("Petición para obtener historial de limpieza.");
        // TODO: Devolver el historial de actividades desde la BD.
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/incidents")
    public ResponseEntity<?> createIncident(@RequestBody Map<String, Object> incident) {
        System.out.println("Registrando incidente: " + incident.toString());
        // TODO: Guardar el incidente en la base de datos.
        return ResponseEntity.ok(Map.of("message", "Incidente creado exitosamente"));
    }

    @GetMapping("/incidents")
    public ResponseEntity<List<?>> getIncidents() {
        System.out.println("Petición para obtener lista de incidentes.");
        // TODO: Devolver la lista de incidentes desde la BD.
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        System.out.println("Recibido archivo para subir: " + file.getOriginalFilename());
        // TODO: Implementar la lógica para guardar el archivo y devolver la URL.
        return ResponseEntity.ok(Map.of(
            "url", "/placeholder.svg?query=uploaded-file",
            "type", file.getContentType().startsWith("image") ? "image" : "video",
            "filename", file.getOriginalFilename(),
            "size", file.getSize()
        ));
    }
}