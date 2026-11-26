package com.chambitos.api.repositorio;

import com.chambitos.api.modelo.Reserva;
import com.chambitos.api.modelo.Usuario;
import com.chambitos.api.modelo.Viaje;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReservaRepositorio extends JpaRepository<Reserva, Long> {

    List<Reserva> findByUsuarioOrderByFechaDescSalidaDesc(Usuario usuario);

    List<Reserva> findByViajeAndFechaAndEstado(Viaje viaje, String fecha, String estado);

    List<Reserva> findByViaje(Viaje viaje);
}
