# Chambitos API

Servidor de la app de Autobuses Chambitos hecho con Spring Boot y MySQL.

## Arrancar

1. Tener MySQL encendido en el puerto 3306. La base de datos `chambitos` se crea sola.
2. Está preparado para el MySQL de XAMPP (usuario root sin contraseña). Si usas otro, pon tu usuario y contraseña en las variables de entorno `DB_USER` y `DB_PASSWORD`.
3. En esta carpeta ejecutar `.\mvnw.cmd spring-boot:run`.

Para usar la base de datos de AWS en vez de la local, mira `bd/GUIA-AWS.md`. El script con las tablas y los datos está en `bd/chambitos.sql`.

La primera vez mete las líneas, los viajes reales y dos cuentas:

- viajero@chambitos.com / Viajero2026!
- admin@chambitos.com / Admin2026!

## Rutas de la API

| Método | Ruta | Quién |
|---|---|---|
| POST | /api/auth/login | todos |
| POST | /api/auth/registro | todos |
| POST | /api/auth/salir | con sesión |
| PUT | /api/usuarios/contrasena | con sesión |
| GET | /api/paradas | todos |
| GET | /api/lineas | todos |
| GET | /api/viajes | todos |
| GET | /api/viajes/buscar?origen=&destino=&fecha= | todos |
| GET | /api/viajes/{id}/asientos?fecha= | todos |
| GET / POST | /api/reservas | con sesión |
| PUT | /api/reservas/{id}/cancelar | con sesión |
| GET / POST / PUT / DELETE | /api/admin/autobuses, /api/admin/lineas, /api/admin/viajes | admin |
| GET | /api/admin/viajes/{id}/pasajeros?fecha= | admin |
| GET | /api/admin/ocupacion?fecha= | admin |

La sesión va en la cabecera `Authorization` con el token que devuelve el login. Si un viajero llama a una ruta de admin recibe un 403.
