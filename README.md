# Chambitos

App de horarios y reservas para **Autobuses Chambitos**. Es nuestro proyecto intermodular de 2º DAM: se pueden consultar los horarios de las líneas 1 y 2, reservar plaza y llevar el billete en el móvil. También tiene una parte de administrador para ver la ocupación y gestionar los autobuses. Funciona en el móvil y en la web desde el ordenador.

## Tecnologías

- **App:** React Native con Expo SDK 57 (móvil y web)
- **API:** Spring Boot 3.4 (Java 17)
- **Base de datos:** MySQL (XAMPP en local)

## Carpetas

- `chambitos-app/` → la app (Expo)
- `chambitos-api/` → el servidor (Spring Boot)
- `prototipo/` → el prototipo en HTML y el logo
- `presentacion/` → la presentación del proyecto

## Cómo arrancarlo en local

1. Abre XAMPP y arranca **MySQL**. La base de datos `chambitos` se crea sola la primera vez, con datos de ejemplo.
2. Arranca la API:
   ```
   cd chambitos-api
   .\mvnw.cmd spring-boot:run
   ```
   Queda en http://localhost:8080
3. Arranca la app (la primera vez haz antes `npm install`):
   ```
   cd chambitos-app
   npx expo start --web
   ```
   Se abre en http://localhost:8081

O directamente haz doble clic en `arrancar.bat` (y `parar.bat` para pararlo todo).

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Viajero | viajero@chambitos.com | Viajero2026! |
| Administrador | admin@chambitos.com | Admin2026! |

## Despliegue en AWS

Los pasos para subirlo a AWS están en [chambitos-api/bd/GUIA-AWS.md](chambitos-api/bd/GUIA-AWS.md).
