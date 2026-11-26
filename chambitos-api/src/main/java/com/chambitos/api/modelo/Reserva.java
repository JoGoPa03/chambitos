package com.chambitos.api.modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String localizador;
    @ManyToOne
    @JsonIgnore
    private Usuario usuario;
    @ManyToOne
    @JsonIgnore
    private Viaje viaje;
    private String fecha;
    private String origen;
    private String destino;
    private String salida;
    private String llegada;
    private String asientos;
    private double precio;
    private String estado;
    private boolean aviso;

    public Reserva() {
    }

    public Long getId() { return id; }
    public String getLocalizador() { return localizador; }
    public void setLocalizador(String localizador) { this.localizador = localizador; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Viaje getViaje() { return viaje; }
    public void setViaje(Viaje viaje) { this.viaje = viaje; }
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    public String getOrigen() { return origen; }
    public void setOrigen(String origen) { this.origen = origen; }
    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }
    public String getSalida() { return salida; }
    public void setSalida(String salida) { this.salida = salida; }
    public String getLlegada() { return llegada; }
    public void setLlegada(String llegada) { this.llegada = llegada; }
    public String getAsientos() { return asientos; }
    public void setAsientos(String asientos) { this.asientos = asientos; }
    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public boolean isAviso() { return aviso; }
    public void setAviso(boolean aviso) { this.aviso = aviso; }
    public String getLinea() { return viaje.getSublinea(); }
    public String getAutobus() { return viaje.getAutobus().getMatricula(); }
}
