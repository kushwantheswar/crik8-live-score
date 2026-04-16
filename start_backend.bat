@echo off
echo Starting Crik8 Backend Server on Port 5000...
cd backend

:: Try python
python manage.py runserver 5000
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] 'python' failed, trying 'py'...
    py manage.py runserver 5000
)
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] 'py' failed, trying 'python3'...
    python3 manage.py runserver 5000
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Could not start Django. Please ensure Python is installed and added to PATH.
)
pause
