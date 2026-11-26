package com.chambitos.api.repositorio;

import com.chambitos.api.modelo.Linea;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LineaRepositorio extends JpaRepository<Linea, Long> {

    Linea findByCodigo(String codigo);
}
