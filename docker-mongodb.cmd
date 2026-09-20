@echo off
setlocal

if "%~1"=="" goto up
if /I "%~1"=="up" goto up
if /I "%~1"=="down" goto down
if /I "%~1"=="logs" goto logs
if /I "%~1"=="status" goto status
if /I "%~1"=="restart" goto restart

echo Usage: docker-mongodb.cmd [up^|down^|logs^|status^|restart]
exit /b 1

:up
echo Starting MongoDB...
docker compose up -d mongodb
goto status

:down
echo Stopping MongoDB container. Named volumes are preserved...
docker compose stop mongodb
exit /b %ERRORLEVEL%

:logs
docker compose logs -f mongodb
exit /b %ERRORLEVEL%

:status
docker compose ps mongodb
exit /b %ERRORLEVEL%

:restart
call "%~f0" down
call "%~f0" up
exit /b %ERRORLEVEL%
