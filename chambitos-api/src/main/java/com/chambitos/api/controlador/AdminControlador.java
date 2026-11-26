package com.chambitos.api.controlador;

import com.chambitos.api.Horas;
import com.chambitos.api.Sesion;
import com.chambitos.api.modelo.*;
import com.chambitos.api.repositorio.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminControlador {

    private final LineaRepositorio lineas;
    private final AutobusRepositorio autobuses;
    private final ViajeRepositorio viajes;
    private final ReservaRepositorio reservas;
    private final Sesion sesion;

    public AdminControlador(LineaRepositorio lineas, AutobusRepositorio autobuses, ViajeRepositorio viajes,
                            ReservaRepositorio reservas, Sesion sesion) {
        this.lineas = lineas;
        this.autobuses = autobuses;
        this.viajes = viajes;
        this.reservas = reservas;
        this.sesion = sesion;
    }

    @GetMapping("/autobuses")
    public List<Autobus> listarAutobuses(@RequestHeader(value = "Authorization", required = false) String token) {
        sesion.admin(token);
        return autobuses.findAll();
    }

    @PostMapping("/autobuses")
    public Autobus crearAutobus(@RequestHeader(value = "Authorization", required = false) String token,
                                @RequestBody Map<String, Object> datos) {
        sesion.admin(token);
        Autobus a = new Autobus();
        rellenarAutobus(a, datos);
        return autobuses.save(a);
    }

    @PutMapping("/autobuses/{id}")
    public Autobus editarAutobus(@RequestHeader(value = "Authorization", required = false) String token,
                                 @PathVariable Long id, @RequestBody Map<String, Object> datos) {
        sesion.admin(token);
        Autobus a = autobuses.findById(id).orElseThrow(() -> noExiste("autobús"));
        rellenarAutobus(a, datos);
        return autobuses.save(a);
    }

    @DeleteMapping("/autobuses/{id}")
    public void borrarAutobus(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable Long id) {
        sesion.admin(token);
        Autobus a = autobuses.findById(id).orElseThrow(() -> noExiste("autobús"));
        if (viajes.existsByAutobus(a)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este autobús tiene viajes asignados, cámbialos antes de borrarlo");
        }
        autobuses.delete(a);
    }

    private void rellenarAutobus(Autobus a, Map<String, Object> datos) {
        String matricula = String.valueOf(datos.get("matricula")).trim().toUpperCase();
        int plazas;
        try {
            plazas = Integer.parseInt(String.valueOf(datos.get("plazas")));
        } catch (NumberFormatException e) {
            plazas = 0;
        }
        if (!matricula.matches("^\\d{4} [A-Z]{3}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La matrícula tiene que ser como 1234 ABC");
        }
        if (plazas < 10 || plazas > 70) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las plazas tienen que estar entre 10 y 70");
        }
        Autobus otro = autobuses.findByMatricula(matricula);
        if (otro != null && !otro.getId().equals(a.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya hay un autobús con esa matrícula");
        }
        a.setMatricula(matricula);
        a.setPlazas(plazas);
    }

    @PostMapping("/lineas")
    @Transactional
    public Linea crearLinea(@RequestHeader(value = "Authorization", required = false) String token,
                            @RequestBody Map<String, Object> datos) {
        sesion.admin(token);
        Linea l = new Linea();
        rellenarLinea(l, datos);
        return lineas.save(l);
    }

    @PutMapping("/lineas/{id}")
    @Transactional
    public Linea editarLinea(@RequestHeader(value = "Authorization", required = false) String token,
                             @PathVariable Long id, @RequestBody Map<String, Object> datos) {
        sesion.admin(token);
        Linea l = lineas.findById(id).orElseThrow(() -> noExiste("línea"));
        rellenarLinea(l, datos);
        return lineas.save(l);
    }

    @DeleteMapping("/lineas/{id}")
    public void borrarLinea(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable Long id) {
        sesion.admin(token);
        Linea l = lineas.findById(id).orElseThrow(() -> noExiste("línea"));
        if (viajes.existsByLinea(l)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta línea tiene viajes, bórralos antes");
        }
        lineas.delete(l);
    }

    private void rellenarLinea(Linea l, Map<String, Object> datos) {
        String codigo = String.valueOf(datos.get("codigo")).trim();
        String nombre = String.valueOf(datos.get("nombre")).trim();
        List<?> paradas = (List<?>) datos.get("paradas");
        if (!codigo.matches("^\\d{1,2}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El número de línea tiene que ser un número");
        }
        if (nombre.length() < 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escribe el nombre de la línea");
        }
        if (paradas == null || paradas.size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Marca al menos dos paradas");
        }
        Linea otra = lineas.findByCodigo(codigo);
        if (otra != null && !otra.getId().equals(l.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya hay una línea con ese número");
        }
        l.setCodigo(codigo);
        l.setNombre(nombre);
        if (datos.get("descripcion") != null) {
            l.setDescripcion(String.valueOf(datos.get("descripcion")));
        }
        l.getParadas().clear();
        for (Object p : paradas) {
            l.anadirParada(String.valueOf(p));
        }
    }

    @GetMapping("/viajes")
    public List<Map<String, Object>> listarViajes(@RequestHeader(value = "Authorization", required = false) String token) {
        sesion.admin(token);
        List<Map<String, Object>> lista = new ArrayList<>();
        for (Viaje v : viajes.findAll()) {
            String fecha = Horas.proximaFecha(v.getDias());
            Map<String, Object> o = new HashMap<>();
            o.put("viaje", v);
            o.put("fecha", fecha);
            o.put("reservadas", ocupadas(v, fecha));
            lista.add(o);
        }
        lista.sort(Comparator.comparing(o -> ((Viaje) o.get("viaje")).getDias() + ((Viaje) o.get("viaje")).getSalida()));
        return lista;
    }

    @PostMapping("/viajes")
    @Transactional
    public Viaje crearViaje(@RequestHeader(value = "Authorization", required = false) String token,
                            @RequestBody Map<String, Object> datos) {
        sesion.admin(token);
        Viaje v = new Viaje();
        rellenarViaje(v, datos);
        return viajes.save(v);
    }

    @PutMapping("/viajes/{id}")
    @Transactional
    public Viaje editarViaje(@RequestHeader(value = "Authorization", required = false) String token,
                             @PathVariable Long id, @RequestBody Map<String, Object> datos) {
        sesion.admin(token);
        Viaje v = viajes.findById(id).orElseThrow(() -> noExiste("viaje"));
        rellenarViaje(v, datos);
        return viajes.save(v);
    }

    @DeleteMapping("/viajes/{id}")
    @Transactional
    public void borrarViaje(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable Long id) {
        sesion.admin(token);
        Viaje v = viajes.findById(id).orElseThrow(() -> noExiste("viaje"));
        reservas.deleteAll(reservas.findByViaje(v));
        viajes.delete(v);
    }

    private void rellenarViaje(Viaje v, Map<String, Object> datos) {
        Linea l = lineas.findById(Long.valueOf(String.valueOf(datos.get("lineaId")))).orElseThrow(() -> noExiste("línea"));
        Autobus a = autobuses.findById(Long.valueOf(String.valueOf(datos.get("autobusId")))).orElseThrow(() -> noExiste("autobús"));
        String sublinea = String.valueOf(datos.get("sublinea")).trim().toLowerCase();
        String dias = String.valueOf(datos.get("dias"));
        String sentido = String.valueOf(datos.get("sentido"));
        String salida = String.valueOf(datos.get("salida")).trim();
        String textoPrecio = datos.get("precio") == null ? "" : String.valueOf(datos.get("precio")).trim().replace(",", ".");
        if (!sublinea.matches("^" + l.getCodigo() + "[a-z]$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La sublínea tiene que ser el número de la línea y una letra, como " + l.getCodigo() + "a");
        }
        if (!salida.matches("^([01]\\d|2[0-3]):[0-5]\\d$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La hora de salida tiene que ser como 07:30");
        }
        if (!dias.equals("L") && !dias.equals("F")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Elige lunes a viernes o fin de semana");
        }
        Double precio = null;
        if (!textoPrecio.isEmpty()) {
            try {
                precio = Double.parseDouble(textoPrecio);
            } catch (NumberFormatException e) {
                precio = -1.0;
            }
            if (precio <= 0 || precio > 50) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El precio tiene que estar entre 0 y 50 €");
            }
        }
        List<String> nombres = new ArrayList<>();
        List<Integer> minutos = new ArrayList<>();
        Viaje modelo = null;
        for (Viaje otro : viajes.findAll()) {
            if (otro.getLinea().getId().equals(l.getId()) && otro.getSentido().equals(sentido) && otro != v) {
                boolean mismaSub = otro.getSublinea().equals(sublinea);
                boolean modeloMismaSub = modelo != null && modelo.getSublinea().equals(sublinea);
                if (modelo == null || (mismaSub && !modeloMismaSub)
                        || (mismaSub == modeloMismaSub && otro.getParadas().size() > modelo.getParadas().size())) {
                    modelo = otro;
                }
            }
        }
        if (modelo != null) {
            int inicio = Horas.minutos(modelo.getSalida());
            for (ParadaViaje p : modelo.getParadas()) {
                nombres.add(p.getNombre());
                minutos.add(Horas.minutos(p.getHora()) - inicio);
            }
        } else {
            List<ParadaLinea> ps = new ArrayList<>(l.getParadas());
            if (sentido.equals("vuelta")) {
                Collections.reverse(ps);
            }
            for (int i = 0; i < ps.size(); i++) {
                nombres.add(ps.get(i).getNombre());
                minutos.add(i * 10);
            }
        }
        v.setLinea(l);
        v.setSublinea(sublinea);
        v.setAutobus(a);
        v.setDias(dias);
        v.setSentido(sentido);
        v.setPrecio(precio);
        v.getParadas().clear();
        int inicio = Horas.minutos(salida);
        for (int i = 0; i < nombres.size(); i++) {
            v.anadirParada(nombres.get(i), Horas.hora(inicio + minutos.get(i)));
        }
    }

    @GetMapping("/viajes/{id}/pasajeros")
    public Map<String, Object> pasajeros(@RequestHeader(value = "Authorization", required = false) String token,
                                         @PathVariable Long id, @RequestParam(required = false) String fecha) {
        sesion.admin(token);
        Viaje v = viajes.findById(id).orElseThrow(() -> noExiste("viaje"));
        if (fecha == null) {
            fecha = Horas.proximaFecha(v.getDias());
        }
        List<Map<String, Object>> lista = new ArrayList<>();
        for (Reserva r : reservas.findByViajeAndFechaAndEstado(v, fecha, "Confirmada")) {
            Map<String, Object> p = new HashMap<>();
            p.put("localizador", r.getLocalizador());
            p.put("nombre", r.getUsuario().getNombre());
            p.put("asientos", r.getAsientos());
            p.put("origen", r.getOrigen());
            p.put("destino", r.getDestino());
            lista.add(p);
        }
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("viaje", v);
        resultado.put("fecha", fecha);
        resultado.put("pasajeros", lista);
        resultado.put("reservadas", ocupadas(v, fecha));
        return resultado;
    }

    @GetMapping("/ocupacion")
    public List<Map<String, Object>> ocupacion(@RequestHeader(value = "Authorization", required = false) String token) {
        sesion.admin(token);
        Map<String, int[]> grupos = new TreeMap<>();
        for (Viaje v : viajes.findAll()) {
            String fecha = Horas.proximaFecha(v.getDias());
            int[] g = grupos.computeIfAbsent(v.getSublinea(), k -> new int[2]);
            g[0] += ocupadas(v, fecha);
            g[1] += v.getAutobus().getPlazas();
        }
        List<Map<String, Object>> lista = new ArrayList<>();
        for (String k : grupos.keySet()) {
            Map<String, Object> o = new HashMap<>();
            o.put("sublinea", k);
            o.put("ocupadas", grupos.get(k)[0]);
            o.put("plazas", grupos.get(k)[1]);
            lista.add(o);
        }
        return lista;
    }

    private int ocupadas(Viaje v, String fecha) {
        int n = 0;
        for (Reserva r : reservas.findByViajeAndFechaAndEstado(v, fecha, "Confirmada")) {
            n += r.getAsientos().split(",").length;
        }
        return n;
    }

    private ResponseStatusException noExiste(String que) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Ese " + que + " no existe");
    }
}
