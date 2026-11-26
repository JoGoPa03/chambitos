package com.chambitos.api.controlador;

import com.chambitos.api.Horas;
import com.chambitos.api.modelo.ParadaViaje;
import com.chambitos.api.modelo.Reserva;
import com.chambitos.api.modelo.Viaje;
import com.chambitos.api.repositorio.LineaRepositorio;
import com.chambitos.api.repositorio.ReservaRepositorio;
import com.chambitos.api.repositorio.ViajeRepositorio;
import com.chambitos.api.modelo.Linea;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ViajeControlador {

    private final ViajeRepositorio viajes;
    private final LineaRepositorio lineas;
    private final ReservaRepositorio reservas;

    public ViajeControlador(ViajeRepositorio viajes, LineaRepositorio lineas, ReservaRepositorio reservas) {
        this.viajes = viajes;
        this.lineas = lineas;
        this.reservas = reservas;
    }

    @GetMapping("/paradas")
    public List<String> paradas() {
        List<String> lista = new ArrayList<>();
        for (Viaje v : viajes.findAll()) {
            for (ParadaViaje p : v.getParadas()) {
                if (!lista.contains(p.getNombre())) {
                    lista.add(p.getNombre());
                }
            }
        }
        Collections.sort(lista);
        return lista;
    }

    @GetMapping("/lineas")
    public List<Linea> lineas() {
        return lineas.findAll();
    }

    @GetMapping("/viajes")
    public List<Viaje> todos() {
        List<Viaje> lista = viajes.findAll();
        lista.sort(Comparator.comparing(Viaje::getSalida));
        return lista;
    }

    @GetMapping("/viajes/{id}")
    public Viaje uno(@PathVariable Long id) {
        return viajes.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ese viaje no existe"));
    }

    @GetMapping("/viajes/buscar")
    public List<Map<String, Object>> buscar(@RequestParam String origen, @RequestParam String destino, @RequestParam String fecha) {
        List<Map<String, Object>> resultado = new ArrayList<>();
        for (Viaje v : viajes.findByDias(Horas.tipoDia(fecha))) {
            int i = posicion(v, origen);
            int j = posicion(v, destino);
            if (i < 0 || j <= i) {
                continue;
            }
            String salida = v.getParadas().get(i).getHora();
            if (Horas.yaHaSalido(fecha, salida)) {
                continue;
            }
            Map<String, Object> r = new HashMap<>();
            r.put("id", v.getId());
            r.put("linea", v.getSublinea());
            r.put("autobus", v.getAutobus().getMatricula());
            r.put("salida", salida);
            r.put("llegada", v.getParadas().get(j).getHora());
            r.put("paradas", j - i);
            r.put("precio", Horas.precio(v, i, j));
            r.put("libres", v.getAutobus().getPlazas() - ocupadas(v, fecha).size());
            resultado.add(r);
        }
        resultado.sort(Comparator.comparing(r -> (String) r.get("salida")));
        return resultado;
    }

    @GetMapping("/viajes/{id}/asientos")
    public Map<String, Object> asientos(@PathVariable Long id, @RequestParam String fecha) {
        Viaje v = viajes.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ese viaje no existe"));
        Map<String, Object> r = new HashMap<>();
        r.put("plazas", v.getAutobus().getPlazas());
        r.put("ocupadas", ocupadas(v, fecha));
        return r;
    }

    public static int posicion(Viaje v, String parada) {
        for (int i = 0; i < v.getParadas().size(); i++) {
            if (v.getParadas().get(i).getNombre().equals(parada)) {
                return i;
            }
        }
        return -1;
    }

    private List<Integer> ocupadas(Viaje v, String fecha) {
        List<Integer> lista = new ArrayList<>();
        for (Reserva r : reservas.findByViajeAndFechaAndEstado(v, fecha, "Confirmada")) {
            for (String a : r.getAsientos().split(",")) {
                lista.add(Integer.parseInt(a));
            }
        }
        return lista;
    }
}
