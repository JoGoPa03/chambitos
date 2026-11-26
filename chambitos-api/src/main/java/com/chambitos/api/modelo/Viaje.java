package com.chambitos.api.modelo;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Viaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Linea linea;
    private String sublinea;
    private Double precio;
    @ManyToOne
    private Autobus autobus;
    private String dias;
    private String sentido;
    @OneToMany(mappedBy = "viaje", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orden")
    private List<ParadaViaje> paradas = new ArrayList<>();

    public Viaje() {
    }

    public Viaje(Linea linea, String sublinea, Autobus autobus, String dias, String sentido) {
        this.linea = linea;
        this.sublinea = sublinea;
        this.autobus = autobus;
        this.dias = dias;
        this.sentido = sentido;
    }

    public void anadirParada(String nombre, String hora) {
        paradas.add(new ParadaViaje(this, paradas.size() + 1, nombre, hora));
    }

    public String getSalida() {
        return paradas.isEmpty() ? "" : paradas.get(0).getHora();
    }

    public Long getId() { return id; }
    public Linea getLinea() { return linea; }
    public void setLinea(Linea linea) { this.linea = linea; }
    public String getSublinea() { return sublinea; }
    public void setSublinea(String sublinea) { this.sublinea = sublinea; }
    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
    public Autobus getAutobus() { return autobus; }
    public void setAutobus(Autobus autobus) { this.autobus = autobus; }
    public String getDias() { return dias; }
    public void setDias(String dias) { this.dias = dias; }
    public String getSentido() { return sentido; }
    public void setSentido(String sentido) { this.sentido = sentido; }
    public List<ParadaViaje> getParadas() { return paradas; }
}
