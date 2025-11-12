// src/main/java/com/ffa/repository/AdminRepository.java
package com.ffa.repository;

import com.ffa.domain.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUsernameIgnoreCase(String username);
}
