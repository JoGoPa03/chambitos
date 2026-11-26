SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS chambitos CHARACTER SET utf8mb4;
USE chambitos;

DROP TABLE IF EXISTS reserva;
DROP TABLE IF EXISTS parada_viaje;
DROP TABLE IF EXISTS viaje;
DROP TABLE IF EXISTS parada_linea;
DROP TABLE IF EXISTS linea;
DROP TABLE IF EXISTS autobus;
DROP TABLE IF EXISTS usuario;

CREATE TABLE usuario (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  contrasena VARCHAR(100) NOT NULL,
  rol VARCHAR(10) NOT NULL,
  token VARCHAR(50),
  PRIMARY KEY (id),
  CONSTRAINT uk_usuario_correo UNIQUE (correo),
  CONSTRAINT ck_usuario_rol CHECK (rol IN ('viajero', 'admin'))
);

CREATE TABLE autobus (
  id BIGINT NOT NULL AUTO_INCREMENT,
  matricula VARCHAR(10) NOT NULL,
  plazas INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_autobus_matricula UNIQUE (matricula),
  CONSTRAINT ck_autobus_plazas CHECK (plazas BETWEEN 10 AND 70)
);

CREATE TABLE linea (
  id BIGINT NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(5) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  PRIMARY KEY (id),
  CONSTRAINT uk_linea_codigo UNIQUE (codigo)
);

CREATE TABLE parada_linea (
  id BIGINT NOT NULL AUTO_INCREMENT,
  linea_id BIGINT NOT NULL,
  orden INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_parada_linea_linea FOREIGN KEY (linea_id) REFERENCES linea (id) ON DELETE CASCADE
);

CREATE TABLE viaje (
  id BIGINT NOT NULL AUTO_INCREMENT,
  linea_id BIGINT NOT NULL,
  sublinea VARCHAR(3) NOT NULL,
  precio DOUBLE,
  autobus_id BIGINT NOT NULL,
  dias VARCHAR(1) NOT NULL,
  sentido VARCHAR(6) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_viaje_linea FOREIGN KEY (linea_id) REFERENCES linea (id),
  CONSTRAINT fk_viaje_autobus FOREIGN KEY (autobus_id) REFERENCES autobus (id),
  CONSTRAINT ck_viaje_dias CHECK (dias IN ('L', 'F')),
  CONSTRAINT ck_viaje_sentido CHECK (sentido IN ('ida', 'vuelta'))
);

CREATE TABLE parada_viaje (
  id BIGINT NOT NULL AUTO_INCREMENT,
  viaje_id BIGINT NOT NULL,
  orden INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  hora VARCHAR(5) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_parada_viaje_viaje FOREIGN KEY (viaje_id) REFERENCES viaje (id) ON DELETE CASCADE
);

CREATE TABLE reserva (
  id BIGINT NOT NULL AUTO_INCREMENT,
  localizador VARCHAR(10) NOT NULL,
  usuario_id BIGINT NOT NULL,
  viaje_id BIGINT NOT NULL,
  fecha VARCHAR(10) NOT NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  salida VARCHAR(5) NOT NULL,
  llegada VARCHAR(5) NOT NULL,
  asientos VARCHAR(20) NOT NULL,
  precio DOUBLE NOT NULL,
  estado VARCHAR(12) NOT NULL,
  aviso BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id),
  CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
  CONSTRAINT fk_reserva_viaje FOREIGN KEY (viaje_id) REFERENCES viaje (id) ON DELETE CASCADE,
  CONSTRAINT ck_reserva_estado CHECK (estado IN ('Confirmada', 'Cancelada', 'Realizada'))
);

CREATE INDEX idx_reserva_viaje_fecha ON reserva (viaje_id, fecha);

INSERT INTO usuario (id, nombre, correo, contrasena, rol) VALUES
  (1, 'Laura', 'viajero@chambitos.com', '$2a$10$rfXLFXpSo.MLRqXiyBD6SO4eO3gvOEmChFZ7i.omfQam9PfSoRWL6', 'viajero'),
  (2, 'Admin', 'admin@chambitos.com', '$2a$10$qy8gpLtQBkj3IoGdanjtmuiQuGKW97tjFNooPg9QgR1qRHubuUIZe', 'admin');

INSERT INTO autobus (id, matricula, plazas) VALUES
  (1, '4721 LKM', 40),
  (2, '8813 JGT', 40),
  (3, '2290 MBC', 55),
  (4, '6604 KSD', 30);

INSERT INTO linea (id, codigo, nombre, descripcion) VALUES
  (1, '1', 'La Font de la Figuera - Xàtiva', '1a La Font - Xàtiva · 1b La Font - Moixent · 1c La Llosa de Ranes - Xàtiva'),
  (2, '2', 'Llutxent - Xàtiva', '2a Benicolet - Xàtiva · 2b Pinet - Xàtiva');

INSERT INTO parada_linea (linea_id, orden, nombre) VALUES
  (1, 1, 'La Font de la Figuera'),
  (1, 2, 'Moixent'),
  (1, 3, 'Vallada'),
  (1, 4, 'Montesa'),
  (1, 5, 'La Llosa de Ranes'),
  (1, 6, 'Xàtiva'),
  (1, 7, 'C.E. Xàtiva'),
  (1, 8, 'Hospital Xàtiva'),
  (2, 1, 'Benicolet'),
  (2, 2, 'Pinet'),
  (2, 3, 'Llutxent'),
  (2, 4, 'Quatretonda'),
  (2, 5, 'Genovés'),
  (2, 6, 'Xàtiva'),
  (2, 7, 'C.E. Xàtiva'),
  (2, 8, 'Hospital Xàtiva');

INSERT INTO viaje (id, linea_id, sublinea, precio, autobus_id, dias, sentido) VALUES
  (1, 1, '1a', NULL, 1, 'L', 'ida'),
  (2, 1, '1b', NULL, 2, 'L', 'ida'),
  (3, 1, '1c', NULL, 3, 'L', 'ida'),
  (4, 1, '1b', NULL, 4, 'L', 'ida'),
  (5, 1, '1a', NULL, 1, 'L', 'ida'),
  (6, 1, '1a', NULL, 1, 'L', 'vuelta'),
  (7, 1, '1c', NULL, 3, 'L', 'vuelta'),
  (8, 1, '1a', NULL, 2, 'L', 'vuelta'),
  (9, 1, '1b', NULL, 2, 'L', 'vuelta'),
  (10, 1, '1b', NULL, 4, 'L', 'vuelta'),
  (11, 1, '1b', NULL, 4, 'F', 'ida'),
  (12, 1, '1b', NULL, 4, 'F', 'vuelta'),
  (13, 2, '2a', NULL, 3, 'L', 'ida'),
  (14, 2, '2b', NULL, 3, 'L', 'ida'),
  (15, 2, '2a', NULL, 3, 'L', 'vuelta'),
  (16, 2, '2b', NULL, 4, 'L', 'vuelta');

INSERT INTO parada_viaje (viaje_id, orden, nombre, hora) VALUES
  (1, 1, 'La Font de la Figuera', '06:35'),
  (1, 2, 'Moixent', '06:50'),
  (1, 3, 'Vallada', '07:05'),
  (1, 4, 'Montesa', '07:15'),
  (1, 5, 'La Llosa de Ranes', '07:26'),
  (1, 6, 'Xàtiva', '07:36'),
  (1, 7, 'C.E. Xàtiva', '07:39'),
  (1, 8, 'Hospital Xàtiva', '07:47'),
  (2, 1, 'La Font de la Figuera', '09:45'),
  (2, 2, 'Moixent', '10:00'),
  (3, 1, 'La Llosa de Ranes', '10:00'),
  (3, 2, 'Xàtiva', '10:10'),
  (3, 3, 'C.E. Xàtiva', '10:15'),
  (3, 4, 'Hospital Xàtiva', '10:23'),
  (4, 1, 'La Font de la Figuera', '15:30'),
  (4, 2, 'Moixent', '15:45'),
  (5, 1, 'La Font de la Figuera', '16:35'),
  (5, 2, 'Moixent', '16:45'),
  (5, 3, 'Vallada', '17:00'),
  (5, 4, 'Montesa', '17:10'),
  (5, 5, 'La Llosa de Ranes', '17:21'),
  (5, 6, 'Xàtiva', '17:30'),
  (5, 7, 'C.E. Xàtiva', '17:35'),
  (5, 8, 'Hospital Xàtiva', '17:45'),
  (6, 1, 'Hospital Xàtiva', '12:20'),
  (6, 2, 'C.E. Xàtiva', '12:28'),
  (6, 3, 'Xàtiva', '12:32'),
  (6, 4, 'La Llosa de Ranes', '12:37'),
  (6, 5, 'Montesa', '12:47'),
  (6, 6, 'Vallada', '12:52'),
  (6, 7, 'Moixent', '13:02'),
  (6, 8, 'La Font de la Figuera', '13:22'),
  (7, 1, 'Hospital Xàtiva', '12:30'),
  (7, 2, 'C.E. Xàtiva', '12:38'),
  (7, 3, 'Xàtiva', '12:42'),
  (7, 4, 'La Llosa de Ranes', '12:47'),
  (8, 1, 'Hospital Xàtiva', '17:50'),
  (8, 2, 'C.E. Xàtiva', '17:55'),
  (8, 3, 'Xàtiva', '18:00'),
  (8, 4, 'La Llosa de Ranes', '18:05'),
  (8, 5, 'Montesa', '18:15'),
  (8, 6, 'Vallada', '18:30'),
  (8, 7, 'Moixent', '18:40'),
  (8, 8, 'La Font de la Figuera', '18:55'),
  (9, 1, 'Moixent', '10:00'),
  (9, 2, 'La Font de la Figuera', '10:15'),
  (10, 1, 'Moixent', '16:15'),
  (10, 2, 'La Font de la Figuera', '16:30'),
  (11, 1, 'La Font de la Figuera', '08:30'),
  (11, 2, 'Moixent', '08:45'),
  (12, 1, 'Moixent', '14:30'),
  (12, 2, 'La Font de la Figuera', '14:45'),
  (13, 1, 'Benicolet', '07:05'),
  (13, 2, 'Llutxent', '07:10'),
  (13, 3, 'Quatretonda', '07:15'),
  (13, 4, 'Genovés', '07:25'),
  (13, 5, 'Xàtiva', '07:35'),
  (13, 6, 'C.E. Xàtiva', '07:39'),
  (13, 7, 'Hospital Xàtiva', '07:47'),
  (14, 1, 'Pinet', '15:15'),
  (14, 2, 'Llutxent', '15:25'),
  (14, 3, 'Quatretonda', '15:30'),
  (14, 4, 'Genovés', '15:40'),
  (14, 5, 'Xàtiva', '15:45'),
  (14, 6, 'C.E. Xàtiva', '15:50'),
  (14, 7, 'Hospital Xàtiva', '15:55'),
  (15, 1, 'Hospital Xàtiva', '14:00'),
  (15, 2, 'C.E. Xàtiva', '14:08'),
  (15, 3, 'Xàtiva', '14:12'),
  (15, 4, 'Genovés', '14:22'),
  (15, 5, 'Quatretonda', '14:32'),
  (15, 6, 'Llutxent', '14:37'),
  (15, 7, 'Benicolet', '14:42'),
  (16, 1, 'Hospital Xàtiva', '17:30'),
  (16, 2, 'C.E. Xàtiva', '17:38'),
  (16, 3, 'Xàtiva', '17:42'),
  (16, 4, 'Genovés', '17:52'),
  (16, 5, 'Quatretonda', '18:02'),
  (16, 6, 'Llutxent', '18:07'),
  (16, 7, 'Pinet', '18:17');
