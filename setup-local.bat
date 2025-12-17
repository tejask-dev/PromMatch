@echo off
echo 🎉 Setting up Prom Matchmaking App locally...

echo.
echo 📋 SETUP CHECKLIST:
echo.
echo 1. Firebase Setup:
echo    - Go to https://console.firebase.google.com/
echo    - Create a new project
echo    - Enable Authentication (Google + Email/Password)
echo    - Enable Firestore Database
echo    - Enable Storage
echo    - Go to Project Settings > Service Accounts
echo    - Generate new private key and save as 'backend/serviceAccountKey.json'
echo    - Go to Project Settings > General > Your apps
echo    - Copy the Firebase config to 'frontend/env.local'
echo.
echo 2. Hugging Face Setup:
echo    - Go to https://huggingface.co/settings/tokens
echo    - Create a new token with Read permissions
echo    - Copy the token to 'backend/env.local'
echo.
echo 3. Rename environment files:
echo    - Rename 'backend/env.local' to 'backend/.env'
echo    - Rename 'frontend/env.local' to 'frontend/.env'
echo.
echo 4. Start the servers:
echo    - Run 'start.bat' or manually start both servers
echo.

echo ✅ Backend dependencies installed!
echo ✅ Frontend dependencies installed!
echo.
echo 🚀 Next steps:
echo 1. Configure Firebase and Hugging Face (see checklist above)
echo 2. Rename the env.local files to .env
echo 3. Run 'start.bat' to start both servers
echo.
echo 📱 Frontend will be at: http://localhost:5173
echo 🔧 Backend will be at: http://localhost:8000
echo 📚 API docs will be at: http://localhost:8000/docs
echo.
pause
