# Subir Chambitos a AWS (RDS y EC2)

En esta carpeta está `chambitos.sql`. Crea la base de datos `chambitos` con sus 7 tablas y mete los datos reales: 2 líneas (con sus sublíneas 1a, 1b, 1c, 2a y 2b), 16 paradas de línea, 4 autobuses, 16 viajes con sus 80 horarios y las dos cuentas de prueba (las contraseñas van cifradas con BCrypt). Si lo ejecutas otra vez, borra las tablas y las crea de nuevo, así que se pierden las reservas que haya.

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

## 5. Subir el servidor a una EC2

Así la app no depende de tener el ordenador encendido.

1. En **EC2 → Lanzar instancia**: nombre `chambitos-api`, imagen **Amazon Linux 2023**, tipo `t2.micro` o `t3.micro`, par de claves `vockey` (en AWS Academy) o uno nuevo. En la red, crea un grupo de seguridad `chambitos-api-sg` con SSH (22) desde **Mi IP** y una regla **TCP personalizada, puerto 8080, origen 0.0.0.0/0**.
2. En el grupo `chambitos-bd-sg` de la base de datos añade otra regla MYSQL/Aurora (3306) con origen el grupo `chambitos-api-sg`, para que la EC2 pueda entrar en la base de datos.
3. En el ordenador, genera el jar desde `chambitos-api`:
   ```
   .\mvnw.cmd clean package -DskipTests
   ```
   Queda en `target\chambitos-api-1.0.0.jar`.
4. Cópialo a la EC2 (en AWS Academy la clave es `labsuser.pem`, se descarga en **AWS Details**):
   ```
   scp -i labsuser.pem target\chambitos-api-1.0.0.jar ec2-user@IP_PUBLICA_EC2:/home/ec2-user/api.jar
   ssh -i labsuser.pem ec2-user@IP_PUBLICA_EC2
   ```
5. Dentro de la EC2 instala Java y arranca el servidor:
   ```
   sudo dnf install -y java-17-amazon-corretto-headless
   export DB_URL="jdbc:mysql://PUNTO_DE_ENLACE:3306/chambitos?serverTimezone=Europe/Madrid"
   export DB_USER="admin"
   export DB_PASSWORD="tu contraseña"
   nohup java -jar api.jar > api.log 2>&1 &
   ```
   Para comprobarlo, abre en el navegador `http://IP_PUBLICA_EC2:8080/api/viajes`. Tienen que salir los 16 viajes.
6. En la app, abre `chambitos-app/src/api.js` y pon la dirección en la constante de arriba:
   ```
   const SERVIDOR_AWS = 'http://IP_PUBLICA_EC2:8080';
   ```
   Si la dejas vacía (`''`), la app vuelve a usar el servidor local.

La IP pública de la EC2 cambia cada vez que la paras y la arrancas (en AWS Academy pasa al empezar cada laboratorio), así que tendrás que cambiarla en `api.js` y volver a arrancar el servidor con el paso 5.

## 6. Cosas a tener en cuenta

- En AWS Academy (Learner Lab), al terminar la sesión del laboratorio la base de datos se para y vuelve a arrancar en la siguiente. El punto de enlace no cambia.
- Cuando ya no la necesites, bórrala desde RDS para no gastar crédito.
- Cuando no la uses, para también la EC2.
