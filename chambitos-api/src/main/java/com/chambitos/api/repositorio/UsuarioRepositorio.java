package com.chambitos.api.repositorio;

import com.chambitos.api.modelo.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {

    Usuario findByCorreo(String correo);

    Usuario findByToken(String token);
}
