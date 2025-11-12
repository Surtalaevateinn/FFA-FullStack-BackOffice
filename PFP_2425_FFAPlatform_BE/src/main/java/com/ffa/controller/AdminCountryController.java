// src/main/java/com/ffa/controller/AdminCountryController.java
package com.ffa.controller;

import com.ffa.domain.Country;
import com.ffa.service.CountryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/ffaAPI/admin/countries")
public class AdminCountryController {

    private final CountryService service;

    public AdminCountryController(CountryService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public ResponseEntity<Country> create(@Valid @RequestBody Country c) {
        Country saved = service.create(c);
        return ResponseEntity.created(URI.create("/ffaAPI/admin/countries/findById/" + saved.getId())).body(saved);
    }

    @GetMapping("/list")
    public List<Country> list() {
        return service.list();
    }

    @PutMapping("/update/{id}")
    public Country update(@PathVariable Long id, @RequestBody Country input) {
        return service.update(id, input);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/findByName")
    public List<Country> findByName(@RequestParam String q) {
        return service.findByName(q);
    }
}
