package com.chambitos.api.modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class ParadaLinea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JsonIgnore
    private Linea linea;
    private int orden;
    private String nombre;

    public ParadaLinea() {
    }

    public ParadaLinea(Linea linea, int orden, String nombre) {
        this.linea = linea;
        this.orden = orden;
        this.nombre = nombre;
    }

    public Long getId() { return id; }
    public int getOrden() { return orden; }
    public String getNombre() { return nombre; }
}
