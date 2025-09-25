package com.ucp.aseo_ucp.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ucp.aseo_ucp.dto.LoginRequest;
import com.ucp.aseo_ucp.dto.RegisterRequest;
import com.ucp.aseo_ucp.model.User;
import com.ucp.aseo_ucp.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User newUser = authService.registerUser(request);
            // TODO: Generar un token JWT real.
            String mockToken = "fake-jwt-token-for-" + newUser.getEmail();

            // Estructuramos la respuesta como la espera el frontend.
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", mockToken);
            responseBody.put("user", newUser);

            return ResponseEntity.ok(responseBody);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // 1. Llamamos al servicio para validar las credenciales.
            User user = authService.loginUser(request);

            // TODO: Generar un token JWT real.
            String mockToken = "fake-jwt-token-for-" + user.getEmail();

            // 2. Creamos el cuerpo de la respuesta en el formato exacto que el frontend necesita.
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", mockToken);
            responseBody.put("user", user);

            return ResponseEntity.ok(responseBody);
        } catch (RuntimeException e) {
            // 3. Si las credenciales son inválidas, devolvemos un error 401.
            return ResponseEntity.status(401).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // --- Métodos restantes como placeholders ---

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        // TODO: Implementar lógica para obtener usuario desde un token JWT real.
        return ResponseEntity.status(501).body(java.util.Map.of("message", "GetCurrentUser no implementado"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(java.util.Map.of("message", "Logout successful"));
    }
}