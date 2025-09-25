package com.ucp.aseo_ucp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ucp.aseo_ucp.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA es tan inteligente que, con solo nombrar este método,
    // él ya sabe que debe buscar un usuario por su columna 'email'.
    // ¡No necesitas escribir la consulta SQL!
    Optional<User> findByEmail(String email);
}