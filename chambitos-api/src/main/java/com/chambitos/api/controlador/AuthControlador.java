package com.chambitos.api.controlador;

import com.chambitos.api.Sesion;
import com.chambitos.api.modelo.Usuario;
import com.chambitos.api.repositorio.UsuarioRepositorio;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AuthControlador {

    private final UsuarioRepositorio usuarios;
    private final BCryptPasswordEncoder encoder;
    private final Sesion sesion;

    public AuthControlador(UsuarioRepositorio usuarios, BCryptPasswordEncoder encoder, Sesion sesion) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.sesion = sesion;
    }

    @PostMapping("/auth/login")
    public Map<String, Object> login(@RequestBody Map<String, String> datos) {
        String correo = datos.getOrDefault("correo", "").trim().toLowerCase();
        String contrasena = datos.getOrDefault("contrasena", "");
        Usuario u = usuarios.findByCorreo(correo);
        if (u == null || !encoder.matches(contrasena, u.getContrasena())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos");
        }
        u.setToken(UUID.randomUUID().toString());
        usuarios.save(u);
        return respuesta(u);
    }

    @PostMapping("/auth/registro")
    public Map<String, Object> registro(@RequestBody Map<String, String> datos) {
        String nombre = datos.getOrDefault("nombre", "").trim();
        String correo = datos.getOrDefault("correo", "").trim().toLowerCase();
        String contrasena = datos.getOrDefault("contrasena", "");
        if (nombre.length() < 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escribe tu nombre completo");
        }
        if (!correo.matches("^\\S+@\\S+\\.\\S+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo no tiene un formato válido");
        }
        if (contrasena.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña necesita al menos 8 caracteres");
        }
        if (usuarios.findByCorreo(correo) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya hay una cuenta con ese correo");
        }
        Usuario u = new Usuario(nombre, correo, encoder.encode(contrasena), "viajero");
        u.setToken(UUID.randomUUID().toString());
        usuarios.save(u);
        return respuesta(u);
    }

    @PostMapping("/auth/salir")
    public void salir(@RequestHeader(value = "Authorization", required = false) String token) {
        Usuario u = sesion.usuario(token);
        u.setToken(null);
        usuarios.save(u);
    }

    @PutMapping("/usuarios/contrasena")
    public void cambiarContrasena(@RequestHeader(value = "Authorization", required = false) String token,
                                  @RequestBody Map<String, String> datos) {
        Usuario u = sesion.usuario(token);
        String actual = datos.getOrDefault("actual", "");
        String nueva = datos.getOrDefault("nueva", "");
        if (!encoder.matches(actual, u.getContrasena())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual no es correcta");
        }
        if (nueva.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña nueva necesita al menos 8 caracteres");
        }
        u.setContrasena(encoder.encode(nueva));
        usuarios.save(u);
    }

    private Map<String, Object> respuesta(Usuario u) {
        Map<String, Object> r = new HashMap<>();
        r.put("token", u.getToken());
        r.put("id", u.getId());
        r.put("nombre", u.getNombre());
        r.put("correo", u.getCorreo());
        r.put("rol", u.getRol());
        return r;
    }
}
