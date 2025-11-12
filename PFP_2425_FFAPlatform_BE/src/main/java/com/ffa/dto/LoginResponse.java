// src/main/java/com/ffa/dto/LoginResponse.java
package com.ffa.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
    private String role; // 这里先固定 ADMIN
}
