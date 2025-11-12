// src/main/java/com/ffa/controller/AuthController.java
package com.ffa.controller;

import com.ffa.dto.LoginRequest;
import com.ffa.dto.LoginResponse;
import com.ffa.security.TokenStore;
import com.ffa.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ffaAPI/auth")
public class AuthController {

    private final AuthService authService;
    private final TokenStore tokenStore;

    public AuthController(AuthService authService, TokenStore tokenStore) {
        this.authService = authService;
        this.tokenStore = tokenStore;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        String token = authService.loginPlain(req.getUsername(), req.getPassword());
        return ResponseEntity.ok(new LoginResponse(token, req.getUsername(), "ADMIN"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String auth) {
        // 前端会传 Bearer <token>
        String token = (auth != null && auth.startsWith("Bearer ")) ? auth.substring(7) : auth;
        String username = tokenStore.getUsername(token);
        if (username == null) return ResponseEntity.status(401).body("Invalid token");
        return ResponseEntity.ok().body(username);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String auth) {
        String token = (auth != null && auth.startsWith("Bearer ")) ? auth.substring(7) : auth;
        tokenStore.revoke(token);
        return ResponseEntity.noContent().build();
    }
}
