package com.ucp.aseo_ucp.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}