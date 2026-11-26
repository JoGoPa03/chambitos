package com.chambitos.api.repositorio;

import com.chambitos.api.modelo.Autobus;
import com.chambitos.api.modelo.Linea;
import com.chambitos.api.modelo.Viaje;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ViajeRepositorio extends JpaRepository<Viaje, Long> {

    List<Viaje> findByDias(String dias);

    boolean existsByAutobus(Autobus autobus);

    boolean existsByLinea(Linea linea);
}
