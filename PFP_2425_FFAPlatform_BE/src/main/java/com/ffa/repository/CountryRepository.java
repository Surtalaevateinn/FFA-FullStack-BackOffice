// src/main/java/com/ffa/repository/CountryRepository.java
package com.ffa.repository;

import com.ffa.domain.Country;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CountryRepository extends JpaRepository<Country, Long> {
    List<Country> findByNameContainingIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
