@echo off
REM Prom Matchmaking App Startup Script for Windows

echo 🎉 Starting Prom Matchmaking App...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    pause
    exit /b 1
)

REM Start backend
echo 🚀 Starting backend server...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
start "Backend Server" cmd /k "python main.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend server...
cd ..\frontend
npm install
start "Frontend Server" cmd /k "npm run dev"

echo ✅ Both servers are starting up!
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause >nul
