package com.tarea4.tarea4.models;

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
@Table(name = "comuna")
public class Comuna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    public Comuna() {
    }

    public Comuna(String nombre, Region region) {
        this.nombre = nombre;
        this.region = region;
    }

    public Integer getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public Region getRegion() {
        return region;
    }
}
