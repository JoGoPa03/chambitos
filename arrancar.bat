@echo off
echo Arrancando Chambitos...
start "MySQL XAMPP" /min C:\xampp\mysql_start.bat
timeout /t 5 /nobreak >nul
start "Servidor Chambitos" cmd /k "cd /d %~dp0chambitos-api && mvnw.cmd spring-boot:run"
echo Esperando al servidor...
timeout /t 30 /nobreak >nul
start "App Chambitos" cmd /k "cd /d %~dp0chambitos-app && npx expo start --web"
echo Listo. Para apagarlo cierra las tres ventanas.
