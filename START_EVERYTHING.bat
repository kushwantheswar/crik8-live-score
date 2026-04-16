@echo off
echo Starting Crik8 Full Stack...
echo ----------------------------

:: Start Backend in a new window
echo [SYSTEM] Starting Backend on Port 5000...
start cmd /k "echo Starting Backend... && cd backend && python manage.py runserver 5000 || py manage.py runserver 5000 || python3 manage.py runserver 5000"

:: Wait 3 seconds for backend to initialize
timeout /t 3 >nul

:: Start Frontend in a new window
echo [SYSTEM] Starting Frontend...
start cmd /k "echo Starting Frontend... && cd frontend && npm run dev"

echo.
echo ----------------------------
echo DONE! Please keep both windows open.
echo Once they are running, go to your browser and refresh.
echo.
pause
