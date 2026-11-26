package com.chambitos.api;

import com.chambitos.api.modelo.Usuario;
import com.chambitos.api.repositorio.UsuarioRepositorio;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class Sesion {

    private final UsuarioRepositorio usuarios;

    public Sesion(UsuarioRepositorio usuarios) {
        this.usuarios = usuarios;
    }

    public Usuario usuario(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tienes que iniciar sesión");
        }
        Usuario u = usuarios.findByToken(token);
        if (u == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La sesión ha caducado, vuelve a entrar");
        }
        return u;
    }

    public Usuario admin(String token) {
        Usuario u = usuario(token);
        if (!u.getRol().equals("admin")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el administrador puede hacer esto");
        }
        return u;
    }
}
