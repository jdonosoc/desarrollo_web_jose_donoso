package com.tarea4.tarea4.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "avistamiento")
public class Avistamiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "voluntario_id", nullable = false)
    private Voluntario voluntario;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "ave_id", nullable = false)
    private Ave ave;

    @NotNull
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @NotNull
    @Column(name = "lugar", nullable = false, length = 200)
    private String lugar;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    public Avistamiento() {
    }

    public Avistamiento(Voluntario voluntario, Ave ave, LocalDateTime fechaHora, String lugar, String descripcion) {
        this.voluntario = voluntario;
        this.ave = ave;
        this.fechaHora = fechaHora;
        this.lugar = lugar;
        this.descripcion = descripcion;
    }

    public Integer getId() {
        return id;
    }

    public Voluntario getVoluntario() {
        return voluntario;
    }

    public Ave getAve() {
        return ave;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public String getLugar() {
        return lugar;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
