package com.chambitos.api.modelo;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Linea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String codigo;
    private String nombre;
    private String descripcion;
    @OneToMany(mappedBy = "linea", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orden")
    private List<ParadaLinea> paradas = new ArrayList<>();

    public Linea() {
    }

    public Linea(String codigo, String nombre, String descripcion) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    public void anadirParada(String nombre) {
        paradas.add(new ParadaLinea(this, paradas.size() + 1, nombre));
    }

    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public List<ParadaLinea> getParadas() { return paradas; }
}
