package com.chambitos.api;

import com.chambitos.api.modelo.*;
import com.chambitos.api.repositorio.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatosIniciales implements CommandLineRunner {

    private final UsuarioRepositorio usuarios;
    private final AutobusRepositorio autobuses;
    private final LineaRepositorio lineas;
    private final ViajeRepositorio viajes;
    private final ReservaRepositorio reservas;
    private final BCryptPasswordEncoder encoder;
    private final List<Viaje> creados = new ArrayList<>();

    public DatosIniciales(UsuarioRepositorio usuarios, AutobusRepositorio autobuses, LineaRepositorio lineas,
                          ViajeRepositorio viajes, ReservaRepositorio reservas, BCryptPasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.autobuses = autobuses;
        this.lineas = lineas;
        this.viajes = viajes;
        this.reservas = reservas;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (usuarios.count() > 0) {
            return;
        }
        Usuario laura = usuarios.save(new Usuario("Laura", "viajero@chambitos.com", encoder.encode("Viajero2026!"), "viajero"));
        usuarios.save(new Usuario("Admin", "admin@chambitos.com", encoder.encode("Admin2026!"), "admin"));

        Autobus b1 = autobuses.save(new Autobus("4721 LKM", 40));
        Autobus b2 = autobuses.save(new Autobus("8813 JGT", 40));
        Autobus b3 = autobuses.save(new Autobus("2290 MBC", 55));
        Autobus b4 = autobuses.save(new Autobus("6604 KSD", 30));

        Linea l1 = linea("1", "La Font de la Figuera - Xàtiva",
                "1a La Font - Xàtiva · 1b La Font - Moixent · 1c La Llosa de Ranes - Xàtiva",
                "La Font de la Figuera", "Moixent", "Vallada", "Montesa", "La Llosa de Ranes", "Xàtiva", "C.E. Xàtiva", "Hospital Xàtiva");
        Linea l2 = linea("2", "Llutxent - Xàtiva", "2a Benicolet - Xàtiva · 2b Pinet - Xàtiva",
                "Benicolet", "Pinet", "Llutxent", "Quatretonda", "Genovés", "Xàtiva", "C.E. Xàtiva", "Hospital Xàtiva");

        viaje(l1, "1a", b1, "L", "ida", "La Font de la Figuera", "06:35", "Moixent", "06:50", "Vallada", "07:05", "Montesa", "07:15",
                "La Llosa de Ranes", "07:26", "Xàtiva", "07:36", "C.E. Xàtiva", "07:39", "Hospital Xàtiva", "07:47");
        viaje(l1, "1b", b2, "L", "ida", "La Font de la Figuera", "09:45", "Moixent", "10:00");
        viaje(l1, "1c", b3, "L", "ida", "La Llosa de Ranes", "10:00", "Xàtiva", "10:10", "C.E. Xàtiva", "10:15", "Hospital Xàtiva", "10:23");
        viaje(l1, "1b", b4, "L", "ida", "La Font de la Figuera", "15:30", "Moixent", "15:45");
        viaje(l1, "1a", b1, "L", "ida", "La Font de la Figuera", "16:35", "Moixent", "16:45", "Vallada", "17:00", "Montesa", "17:10",
                "La Llosa de Ranes", "17:21", "Xàtiva", "17:30", "C.E. Xàtiva", "17:35", "Hospital Xàtiva", "17:45");
        viaje(l1, "1a", b1, "L", "vuelta", "Hospital Xàtiva", "12:20", "C.E. Xàtiva", "12:28", "Xàtiva", "12:32", "La Llosa de Ranes", "12:37",
                "Montesa", "12:47", "Vallada", "12:52", "Moixent", "13:02", "La Font de la Figuera", "13:22");
        viaje(l1, "1c", b3, "L", "vuelta", "Hospital Xàtiva", "12:30", "C.E. Xàtiva", "12:38", "Xàtiva", "12:42", "La Llosa de Ranes", "12:47");
        viaje(l1, "1a", b2, "L", "vuelta", "Hospital Xàtiva", "17:50", "C.E. Xàtiva", "17:55", "Xàtiva", "18:00", "La Llosa de Ranes", "18:05",
                "Montesa", "18:15", "Vallada", "18:30", "Moixent", "18:40", "La Font de la Figuera", "18:55");
        viaje(l1, "1b", b2, "L", "vuelta", "Moixent", "10:00", "La Font de la Figuera", "10:15");
        viaje(l1, "1b", b4, "L", "vuelta", "Moixent", "16:15", "La Font de la Figuera", "16:30");
        viaje(l1, "1b", b4, "F", "ida", "La Font de la Figuera", "08:30", "Moixent", "08:45");
        viaje(l1, "1b", b4, "F", "vuelta", "Moixent", "14:30", "La Font de la Figuera", "14:45");
        viaje(l2, "2a", b3, "L", "ida", "Benicolet", "07:05", "Llutxent", "07:10", "Quatretonda", "07:15", "Genovés", "07:25",
                "Xàtiva", "07:35", "C.E. Xàtiva", "07:39", "Hospital Xàtiva", "07:47");
        viaje(l2, "2b", b3, "L", "ida", "Pinet", "15:15", "Llutxent", "15:25", "Quatretonda", "15:30", "Genovés", "15:40",
                "Xàtiva", "15:45", "C.E. Xàtiva", "15:50", "Hospital Xàtiva", "15:55");
        viaje(l2, "2a", b3, "L", "vuelta", "Hospital Xàtiva", "14:00", "C.E. Xàtiva", "14:08", "Xàtiva", "14:12", "Genovés", "14:22",
                "Quatretonda", "14:32", "Llutxent", "14:37", "Benicolet", "14:42");
        viaje(l2, "2b", b4, "L", "vuelta", "Hospital Xàtiva", "17:30", "C.E. Xàtiva", "17:38", "Xàtiva", "17:42", "Genovés", "17:52",
                "Quatretonda", "18:02", "Llutxent", "18:07", "Pinet", "18:17");

        String[] nombres = {"Lucía Martí", "Pau Ferrer", "Ana Beltrán", "Jorge Sanchis", "Marta Ribes", "Iván Cano", "Elena Soler", "Rubén Vidal"};
        List<Usuario> otros = new ArrayList<>();
        for (int i = 0; i < nombres.length; i++) {
            String correo = "pasajero" + (i + 1) + "@chambitos.com";
            otros.add(usuarios.save(new Usuario(nombres[i], correo, encoder.encode("Pasajero2026!"), "viajero")));
        }

        String laborable = Horas.proximaFecha("L");
        String festivo = Horas.proximaFecha("F");
        int[] cuantos = {17, 9, 22, 12, 21, 11, 26, 15, 4, 8, 2, 5, 26, 20, 9, 31};
        for (int k = 0; k < creados.size(); k++) {
            Viaje v = creados.get(k);
            String fecha = v.getDias().equals("L") ? laborable : festivo;
            for (int n = 0; n < cuantos[k] && n < v.getAutobus().getPlazas(); n++) {
                if (k == 0 && n + 1 == 12) {
                    continue;
                }
                reserva(otros.get(n % otros.size()), v, fecha, 0, v.getParadas().size() - 1, String.valueOf(n + 1), "Confirmada");
            }
        }
        reserva(laura, creados.get(0), laborable, 1, 7, "12", "Confirmada");
        String pasada = LocalDate.now(ZoneId.of("Europe/Madrid")).minusDays(6).toString();
        reserva(laura, creados.get(7), pasada, 2, 3, "7", "Realizada");
    }

    private Linea linea(String codigo, String nombre, String descripcion, String... paradas) {
        Linea l = new Linea(codigo, nombre, descripcion);
        for (String p : paradas) {
            l.anadirParada(p);
        }
        return lineas.save(l);
    }

    private void viaje(Linea linea, String sublinea, Autobus autobus, String dias, String sentido, String... paradas) {
        Viaje v = new Viaje(linea, sublinea, autobus, dias, sentido);
        for (int i = 0; i < paradas.length; i += 2) {
            v.anadirParada(paradas[i], paradas[i + 1]);
        }
        creados.add(viajes.save(v));
    }

    private void reserva(Usuario u, Viaje v, String fecha, int i, int j, String asientos, String estado) {
        Reserva r = new Reserva();
        r.setLocalizador("CH-" + (20100 + reservas.count()));
        r.setUsuario(u);
        r.setViaje(v);
        r.setFecha(fecha);
        r.setOrigen(v.getParadas().get(i).getNombre());
        r.setDestino(v.getParadas().get(j).getNombre());
        r.setSalida(v.getParadas().get(i).getHora());
        r.setLlegada(v.getParadas().get(j).getHora());
        r.setAsientos(asientos);
        r.setPrecio(Horas.precio(v, i, j) * asientos.split(",").length);
        r.setEstado(estado);
        reservas.save(r);
    }
}
