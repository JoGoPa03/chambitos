package com.chambitos.api.repositorio;

import com.chambitos.api.modelo.Autobus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AutobusRepositorio extends JpaRepository<Autobus, Long> {

    Autobus findByMatricula(String matricula);
}
