// src/main/java/com/ffa/service/AuthService.java
package com.ffa.service;

import com.ffa.domain.Admin;
import com.ffa.repository.AdminRepository;
import com.ffa.security.TokenStore;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AdminRepository repo;
    private final TokenStore tokenStore;

    public AuthService(AdminRepository repo, TokenStore tokenStore) {
        this.repo = repo;
        this.tokenStore = tokenStore;
    }

    public String loginPlain(String username, String password) {
        Admin admin = repo.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        if (Boolean.FALSE.equals(admin.getEnabled())) {
            throw new IllegalArgumentException("账户已被禁用");
        }

        // 演示用：明文比较；正式环境请使用 BCrypt
        if (!admin.getPassword().equals(password)) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
        return tokenStore.issueToken(admin.getUsername());
    }
}
