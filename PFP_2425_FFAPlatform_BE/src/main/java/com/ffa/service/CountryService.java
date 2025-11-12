// src/main/java/com/ffa/service/CountryService.java
package com.ffa.service;

import com.ffa.domain.Country;
import com.ffa.repository.CountryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CountryService {
    private final CountryRepository repo;
    public CountryService(CountryRepository repo) { this.repo = repo; }

    public List<Country> list() { return repo.findAll(); }

    @Transactional
    public Country create(Country c) {
        if (repo.existsByNameIgnoreCase(c.getName())) {
            throw new IllegalArgumentException("Country already exists");
        }
        return repo.save(c);
    }

    @Transactional
    public Country update(Long id, Country input) {
        Country c = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (input.getName() != null) c.setName(input.getName());
        if (input.getIsoCode() != null) c.setIsoCode(input.getIsoCode());
        return repo.save(c);
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Not found");
        repo.deleteById(id);
    }

    public List<Country> findByName(String q) {
        return repo.findByNameContainingIgnoreCase(q);
    }
}
