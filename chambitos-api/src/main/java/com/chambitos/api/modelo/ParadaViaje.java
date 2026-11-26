package com.chambitos.api.modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class ParadaViaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JsonIgnore
    private Viaje viaje;
    private int orden;
    private String nombre;
    private String hora;

    public ParadaViaje() {
    }

    public ParadaViaje(Viaje viaje, int orden, String nombre, String hora) {
        this.viaje = viaje;
        this.orden = orden;
        this.nombre = nombre;
        this.hora = hora;
    }

    public Long getId() { return id; }
    public int getOrden() { return orden; }
    public String getNombre() { return nombre; }
    public String getHora() { return hora; }
}
