// src/main/java/com/ucp/aseo_ucp/controller/CleaningController.java

package com.ucp.aseo_ucp.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
// ¡MUY IMPORTANTE! Esto permite que tu frontend (en localhost:3000) pueda hablar con tu backend.
@CrossOrigin(origins = "http://localhost:3000")
public class CleaningController {

    // Este método responde a GET /api/bathrooms
    @GetMapping("/bathrooms")
    public ResponseEntity<List<Map<String, Object>>> getBathrooms() {
        // Aquí iría la lógica para buscar los baños en la base de datos.
        // Por ahora, devolvemos una lista vacía para que la conexión funcione.
        System.out.println("Petición recibida en /api/bathrooms");
        return ResponseEntity.ok(List.of());
    }

    // Este método responde a POST /api/cleaning-activities
    @PostMapping("/cleaning-activities")
    public ResponseEntity<Map<String, String>> createCleaningActivity(@RequestBody Map<String, Object> payload) {
        // Aquí recibes los datos del formulario de limpieza.
        System.out.println("Actividad de limpieza recibida: " + payload.toString());
        return ResponseEntity.ok(Map.of("message", "Actividad registrada exitosamente"));
    }

    // Debes crear un método para cada endpoint que tu frontend necesita:
    // @PostMapping("/incidents")
    // @PostMapping("/upload")
    // etc.
}