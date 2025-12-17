@echo off
echo 🚀 Starting Prom Matchmaking App...

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate && python main.py"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting up!
echo.
echo 📱 Frontend will be at: http://localhost:5173
echo 🔧 Backend will be at: http://localhost:8000
echo 📚 API docs will be at: http://localhost:8000/docs
echo.
echo Press any key to exit this window...
pause >nul
