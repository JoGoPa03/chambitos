# Subir la base de datos de Chambitos a AWS (RDS)

En esta carpeta está `chambitos.sql`. Crea la base de datos `chambitos` con sus 7 tablas y mete los datos reales: 5 sublíneas, 28 paradas, 4 autobuses, 16 viajes con sus 80 horarios y las dos cuentas de prueba (las contraseñas van cifradas con BCrypt). Si lo ejecutas otra vez, borra las tablas y las crea de nuevo, así que se pierden las reservas que haya.

## 1. Crear la base de datos en RDS

En la consola de AWS entra en **RDS → Crear base de datos** y elige esto:

- Método: Creación estándar
- Motor: MySQL 8.0
- Plantilla: Capa gratuita (en AWS Academy, si no aparece, Desarrollo y pruebas)
- Identificador: `chambitos-bd`
- Usuario maestro: `admin`, con una contraseña que apuntes
- Clase de instancia: `db.t3.micro` o `db.t4g.micro`
- Almacenamiento: 20 GB, sin escalado automático
- Conectividad: Acceso público **Sí**, y crea un grupo de seguridad nuevo llamado `chambitos-bd-sg`
- En Configuración adicional, deja vacío el nombre de la base de datos inicial (la crea el script) y quita las copias de seguridad automáticas para no gastar crédito

Tarda unos 5 minutos en ponerse en "Disponible". Cuando esté, copia el **Punto de enlace** (algo como `chambitos-bd.xxxxxxxx.us-east-1.rds.amazonaws.com`).

## 2. Abrir el puerto 3306

En la base de datos, pulsa el grupo de seguridad `chambitos-bd-sg` → **Editar reglas de entrada** → Agregar regla: tipo **MYSQL/Aurora**, puerto 3306, origen **Mi IP**. Si cambias de red (casa, instituto), tendrás que actualizar la IP.

## 3. Ejecutar el script

Con MySQL Workbench: crea una conexión con el punto de enlace como host, el puerto 3306 y el usuario `admin`. Después ve a **File → Run SQL Script** y elige `chambitos.sql`.

O desde PowerShell con el cliente de XAMPP, desde la carpeta `chambitos-api`:

```
C:\xampp\mysql\bin\mysql.exe -h PUNTO_DE_ENLACE -P 3306 -u admin -p < bd\chambitos.sql
```

Para comprobarlo, ejecuta `SELECT COUNT(*) FROM chambitos.viaje;`. Tiene que dar 16.

## 4. Conectar el servidor a AWS

El servidor lee la conexión de tres variables de entorno. Si no existen, usa el MySQL local de XAMPP. En PowerShell, dentro de `chambitos-api`:

```
$env:DB_URL="jdbc:mysql://PUNTO_DE_ENLACE:3306/chambitos?serverTimezone=Europe/Madrid"
$env:DB_USER="admin"
$env:DB_PASSWORD="tu contraseña"
.\mvnw.cmd spring-boot:run
```

La app no cambia: sigue llamando al servidor en localhost:8080, pero ahora los datos se guardan en AWS. Las variables solo duran mientras esa ventana de PowerShell esté abierta.

La contraseña no se escribe en `application.properties`, así no acaba subida a GitHub.

## 5. Cosas a tener en cuenta

- En AWS Academy (Learner Lab), al terminar la sesión del laboratorio la base de datos se para y vuelve a arrancar en la siguiente. El punto de enlace no cambia.
- Cuando ya no la necesites, bórrala desde RDS para no gastar crédito.
- El siguiente paso sería subir también el servidor (por ejemplo a una EC2 o a Elastic Beanstalk) y poner su dirección en `src/api.js` de la app.
