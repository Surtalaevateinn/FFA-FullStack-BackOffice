// src/main/java/com/ffa/controller/HealthController.java
package com.ffa.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ffaAPI")
public class HealthController {
    @GetMapping("/health")
    public String health() { return "OK"; }
}
