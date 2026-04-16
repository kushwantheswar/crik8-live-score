@echo off
echo Testing Connection to Crik8 Backend (Port 5000)...
echo ---------------------------------------
curl.exe -f http://127.0.0.1:5000/api/matches/
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Could not reach the backend at http://127.0.0.1:5000/api/
    echo Please make sure you have run 'start_backend.bat' and it is showing "Starting development server at http://127.0.0.1:5000/"
) else (
    echo [SUCCESS] Backend is reachable!
)
pause
