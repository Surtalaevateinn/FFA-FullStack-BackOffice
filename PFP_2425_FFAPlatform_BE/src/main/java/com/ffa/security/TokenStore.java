// src/main/java/com/ffa/security/TokenStore.java
package com.ffa.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenStore {
    private final Map<String, String> tokenToUser = new ConcurrentHashMap<>();

    public String issueToken(String username) {
        String token = UUID.randomUUID().toString().replace("-", "");
        tokenToUser.put(token, username);
        return token;
    }

    public String getUsername(String token) {
        return tokenToUser.get(token);
    }

    public void revoke(String token) {
        tokenToUser.remove(token);
    }
}
