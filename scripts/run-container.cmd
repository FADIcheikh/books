@echo off
REM Run Frappe Books in Docker (requires Docker Desktop and an X server like VcXsrv)
docker build -t frappe-books .
docker run --rm -e DISPLAY=host.docker.internal:0.0 -p 6969:6969 frappe-books
