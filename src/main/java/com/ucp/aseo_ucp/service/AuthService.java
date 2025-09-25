package com.ucp.aseo_ucp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ucp.aseo_ucp.dto.LoginRequest;
import com.ucp.aseo_ucp.dto.RegisterRequest;
import com.ucp.aseo_ucp.model.User;
import com.ucp.aseo_ucp.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- MÉTODO PARA REGISTRAR (YA LO TENÍAS) ---
    public User registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("El correo electrónico ya está en uso");
        }

        User newUser = new User();
        newUser.setFullName(request.getFullName());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(User.Role.valueOf(request.getRole()));

        return userRepository.save(newUser);
    }

    // --- MÉTODO PARA LOGIN (CORREGIDO) ---
    public User loginUser(LoginRequest request) {
        // 1. Buscamos al usuario por su email.
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        // 2. Comparamos la contraseña enviada con la guardada.
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        // 3. Si todo es correcto, devolvemos el usuario.
        return user;
    }
}