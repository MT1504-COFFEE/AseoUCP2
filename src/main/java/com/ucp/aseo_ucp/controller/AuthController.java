package com.ucp.aseo_ucp.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; // 1. Importamos la herramienta JWT
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
import com.ucp.aseo_ucp.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor // Usamos esto para inyectar las dependencias
public class AuthController {

    // Inyectamos todas las herramientas que necesitamos a través del constructor
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User newUser = authService.registerUser(request);
            
            // 2. Generamos un TOKEN REAL para el nuevo usuario
            final UserDetails userDetails = userDetailsService.loadUserByUsername(newUser.getEmail());
            final String token = jwtUtil.generateToken(userDetails);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", token);
            responseBody.put("user", newUser);

            return ResponseEntity.ok(responseBody);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = authService.loginUser(request);

            // 3. Generamos un TOKEN REAL para el usuario que inicia sesión
            final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            final String token = jwtUtil.generateToken(userDetails);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", token);
            responseBody.put("user", user);

            return ResponseEntity.ok(responseBody);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    // Dejamos los otros métodos como estaban por ahora
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.status(501).body(java.util.Map.of("message", "GetCurrentUser no implementado"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(java.util.Map.of("message", "Logout successful"));
    }
}