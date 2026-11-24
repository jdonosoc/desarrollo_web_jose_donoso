package com.tarea4.tarea4.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tarea4.tarea4.services.ApiService;

@RestController
public class ApiController {

    private final ApiService apiService;

    public ApiController(ApiService apiService) {
        this.apiService = apiService;
    }

    @GetMapping("/get-avistamientos")
    public Map<String, List<Map<String, Object>>> getAvistamientosEndpoint(
            @RequestParam(value = "q", defaultValue = "") String query) {
        List<Map<String, Object>> avistamientos = apiService.getAvistamientos(query);
        return Map.of("data", avistamientos);
    }

    @PostMapping("/post-nota")
    public ResponseEntity<Map<String, Object>> postNotaEndpoint(@RequestBody Map<String, Object> payload) {
        try {
            Integer avistamientoId = parseStrictInteger(payload.get("avistamiento_id"), "avistamiento_id");
            Integer notaValor = parseStrictInteger(payload.get("nota"), "nota");
            Map<String, Object> result = apiService.addNota(avistamientoId, notaValor);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private Integer parseStrictInteger(Object value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException("El campo " + fieldName + " es obligatorio.");
        }
        if (value instanceof Integer intVal) {
            return intVal;
        }
        if (value instanceof Long longVal) {
            return longVal.intValue();
        }
        if (value instanceof String strVal) {
            String trimmed = strVal.trim();
            if (!trimmed.matches("^-?\\d+$")) {
                throw new IllegalArgumentException("El campo " + fieldName + " debe ser un número entero.");
            }
            return Integer.parseInt(trimmed);
        }
        throw new IllegalArgumentException("El campo " + fieldName + " debe ser un número entero.");
    }
}
