@echo off
echo.
echo  ========================================
echo   PROM MATCHMAKING - SUPABASE EDITION
echo  ========================================
echo.
echo  Starting servers...
echo.

REM Start Backend
echo  [1/2] Starting Backend Server...
start "Backend - FastAPI" cmd /k "cd backend && venv\Scripts\activate && python main.py"

REM Wait for backend
timeout /t 3 /nobreak >nul

REM Start Frontend
echo  [2/2] Starting Frontend Server...
start "Frontend - Vite" cmd /k "cd frontend && npm run dev"

echo.
echo  ========================================
echo   SERVERS STARTING UP!
echo  ========================================
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
echo  Press any key to close this window...
echo  (Servers will keep running in their windows)
echo.
pause >nul
