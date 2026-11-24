package com.tarea4.tarea4.services;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.tarea4.tarea4.models.Avistamiento;
import com.tarea4.tarea4.models.AvistamientoRepository;
import com.tarea4.tarea4.models.Nota;
import com.tarea4.tarea4.models.NotaRepository;

@Service
public class ApiService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    private final AvistamientoRepository avistamientoRepository;
    private final NotaRepository notaRepository;

    public ApiService(AvistamientoRepository avistamientoRepository, NotaRepository notaRepository) {
        this.avistamientoRepository = avistamientoRepository;
        this.notaRepository = notaRepository;
    }

    public List<Map<String, Object>> getAvistamientos(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String lowerQuery = query.trim().toLowerCase(Locale.ROOT);
        List<Avistamiento> avistamientos = avistamientoRepository.findAllByOrderByFechaHoraDesc();
        List<Avistamiento> matchAvistamientos = new ArrayList<>();
        for (Avistamiento a : avistamientos) {
            String nombreAve = a.getAve().getNombre().toLowerCase(Locale.ROOT);
            String nombreVoluntario = a.getVoluntario().getNombre().toLowerCase(Locale.ROOT);
            String nombreComuna = a.getVoluntario().getComuna().getNombre().toLowerCase(Locale.ROOT);

            if (nombreAve.contains(lowerQuery)
                    || nombreVoluntario.contains(lowerQuery)
                    || nombreComuna.contains(lowerQuery)) {
                matchAvistamientos.add(a);
            }
        }

        if (matchAvistamientos.isEmpty()) {
            return Collections.emptyList();
        }

        List<Integer> ids = new ArrayList<>();
        for (Avistamiento a : matchAvistamientos) {
            ids.add(a.getId());
        }

        Map<Integer, List<Integer>> notasPorAvistamiento = new HashMap<>();
        for (Nota n : notaRepository.findByAvistamientoIdIn(ids)) {
            Integer avistamientoId = n.getAvistamiento().getId();
            notasPorAvistamiento
                    .computeIfAbsent(avistamientoId, k -> new ArrayList<>())
                    .add(n.getNota());
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Avistamiento a : matchAvistamientos) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", a.getId());
            item.put("nombre_voluntario", a.getVoluntario().getNombre());
            item.put("dia", a.getFechaHora().format(DATE_FORMATTER));
            item.put("nombre_ave", a.getAve().getNombre());
            item.put("nombre_comuna", a.getVoluntario().getComuna().getNombre());

            List<Integer> notas = notasPorAvistamiento.get(a.getId());
            item.put("nota", (notas == null || notas.isEmpty()) ? "-" : formatPromedio(calcularPromedio(notas)));
            result.add(item);
        }

        return result;
    }

    public Map<String, Object> addNota(Integer avistamientoId, Integer notaValor) {
        if (avistamientoId == null) {
            throw new IllegalArgumentException("El id del avistamiento es obligatorio.");
        }
        if (!Nota.validateNota(notaValor)) {
            throw new IllegalArgumentException("La nota debe ser un número entero entre 1 y 7.");
        }

        Avistamiento avistamiento = avistamientoRepository.findById(avistamientoId)
                .orElseThrow(() -> new IllegalArgumentException("Avistamiento no encontrado."));

        Nota nota = new Nota(avistamiento, notaValor);
        notaRepository.save(nota);

        List<Nota> notasEntity = notaRepository.findByAvistamientoId(avistamientoId);
        List<Integer> valores = new ArrayList<>();
        for (Nota n : notasEntity) {
            valores.add(n.getNota());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("avistamiento_id", avistamientoId);
        response.put("nota", notaValor);
        response.put("promedio", valores.isEmpty() ? "-" : formatPromedio(calcularPromedio(valores)));
        return response;
    }

    private Double calcularPromedio(List<Integer> notas) {
        int suma = 0;
        for (Integer valor : notas) {
            suma += valor;
        }
        return (double) suma / notas.size();
    }

    private String formatPromedio(Double promedio) {
        return String.format(Locale.US, "%.1f", promedio);
    }
}
