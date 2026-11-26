package com.chambitos.api.controlador;

import com.chambitos.api.Horas;
import com.chambitos.api.Sesion;
import com.chambitos.api.modelo.Reserva;
import com.chambitos.api.modelo.Usuario;
import com.chambitos.api.modelo.Viaje;
import com.chambitos.api.repositorio.ReservaRepositorio;
import com.chambitos.api.repositorio.ViajeRepositorio;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController
@RequestMapping("/api/reservas")
public class ReservaControlador {

    private final ReservaRepositorio reservas;
    private final ViajeRepositorio viajes;
    private final Sesion sesion;

    public ReservaControlador(ReservaRepositorio reservas, ViajeRepositorio viajes, Sesion sesion) {
        this.reservas = reservas;
        this.viajes = viajes;
        this.sesion = sesion;
    }

    @GetMapping
    public List<Reserva> misReservas(@RequestHeader(value = "Authorization", required = false) String token) {
        Usuario u = sesion.usuario(token);
        List<Reserva> lista = reservas.findByUsuarioOrderByFechaDescSalidaDesc(u);
        for (Reserva r : lista) {
            if (r.getEstado().equals("Confirmada") && Horas.yaHaSalido(r.getFecha(), r.getSalida())) {
                r.setEstado("Realizada");
                reservas.save(r);
            }
        }
        return lista;
    }

    @PostMapping
    @Transactional
    public Reserva reservar(@RequestHeader(value = "Authorization", required = false) String token,
                            @RequestBody Map<String, Object> datos) {
        Usuario u = sesion.usuario(token);
        Long viajeId = Long.valueOf(datos.get("viajeId").toString());
        String fecha = datos.get("fecha").toString();
        String origen = datos.get("origen").toString();
        String destino = datos.get("destino").toString();
        List<?> asientos = (List<?>) datos.get("asientos");

        Viaje v = viajes.findById(viajeId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ese viaje no existe"));
        int i = ViajeControlador.posicion(v, origen);
        int j = ViajeControlador.posicion(v, destino);
        if (i < 0 || j <= i) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este autobús no hace ese trayecto");
        }
        if (!v.getDias().equals(Horas.tipoDia(fecha))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este autobús no sale ese día");
        }
        if (Horas.yaHaSalido(fecha, v.getParadas().get(i).getHora())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este autobús ya ha salido");
        }
        if (asientos == null || asientos.isEmpty() || asientos.size() > 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Elige entre 1 y 4 plazas");
        }

        List<String> ocupadas = new ArrayList<>();
        for (Reserva r : reservas.findByViajeAndFechaAndEstado(v, fecha, "Confirmada")) {
            ocupadas.addAll(Arrays.asList(r.getAsientos().split(",")));
        }
        List<String> elegidos = new ArrayList<>();
        for (Object a : asientos) {
            int numero = Integer.parseInt(a.toString());
            if (numero < 1 || numero > v.getAutobus().getPlazas()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La plaza " + numero + " no existe");
            }
            if (ocupadas.contains(String.valueOf(numero))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "La plaza " + numero + " ya está ocupada");
            }
            elegidos.add(String.valueOf(numero));
        }

        Reserva r = new Reserva();
        r.setLocalizador("CH-" + (10000 + new Random().nextInt(90000)));
        r.setUsuario(u);
        r.setViaje(v);
        r.setFecha(fecha);
        r.setOrigen(origen);
        r.setDestino(destino);
        r.setSalida(v.getParadas().get(i).getHora());
        r.setLlegada(v.getParadas().get(j).getHora());
        r.setAsientos(String.join(",", elegidos));
        r.setPrecio(Math.round(Horas.precio(v, i, j) * elegidos.size() * 100) / 100.0);
        r.setEstado("Confirmada");
        return reservas.save(r);
    }

    @PutMapping("/{id}/aviso")
    public Reserva aviso(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable Long id,
                         @RequestBody Map<String, Boolean> datos) {
        Usuario u = sesion.usuario(token);
        Reserva r = reservas.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Esa reserva no existe"));
        if (!r.getUsuario().getId().equals(u.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esa reserva no es tuya");
        }
        r.setAviso(Boolean.TRUE.equals(datos.get("aviso")));
        return reservas.save(r);
    }

    @PutMapping("/{id}/cancelar")
    public Reserva cancelar(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable Long id) {
        Usuario u = sesion.usuario(token);
        Reserva r = reservas.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Esa reserva no existe"));
        if (!r.getUsuario().getId().equals(u.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esa reserva no es tuya");
        }
        if (!r.getEstado().equals("Confirmada") || Horas.yaHaSalido(r.getFecha(), r.getSalida())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se puede cancelar un viaje que aún no ha salido");
        }
        r.setEstado("Cancelada");
        return reservas.save(r);
    }
}
