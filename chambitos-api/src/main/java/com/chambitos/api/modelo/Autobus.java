package com.chambitos.api.modelo;

import jakarta.persistence.*;

@Entity
public class Autobus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String matricula;
    private int plazas;

    public Autobus() {
    }

    public Autobus(String matricula, int plazas) {
        this.matricula = matricula;
        this.plazas = plazas;
    }

    public Long getId() { return id; }
    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public int getPlazas() { return plazas; }
    public void setPlazas(int plazas) { this.plazas = plazas; }
}
