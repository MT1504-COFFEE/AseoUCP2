package com.ucp.aseo_ucp.dto;

import lombok.Data;

@Data // Lombok genera getters y setters automáticamente
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String role;
}