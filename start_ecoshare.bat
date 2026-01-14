@echo off
echo ========================================
echo    EcoShare Startup Script
echo ========================================
echo.

REM Kill any existing Node.js and Vite processes
echo Stopping any existing EcoShare processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq EcoShare Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq EcoShare Frontend*" >nul 2>&1
echo Done cleaning up old processes.
echo.

REM -------------------------------------------------
REM Ensure dependencies are installed
IF NOT EXIST "node_modules" (
    echo Installing frontend dependencies...
    npm ci
)
IF NOT EXIST "server\node_modules" (
    echo Installing backend dependencies...
    cd server
    npm ci
    cd ..
)
REM -------------------------------------------------

REM Wait a moment for ports to be released
timeout /t 2 /nobreak >nul

REM Start Backend Server
echo Starting EcoShare Backend Server...
start "EcoShare Backend" cmd /k "cd /d %~dp0server && echo Backend Server Starting... && node index.js"
echo Backend server starting on http://localhost:3000
echo.

REM Wait a moment before starting frontend
timeout /t 3 /nobreak >nul

REM Start Frontend Development Server
echo Starting EcoShare Frontend...
start "EcoShare Frontend" cmd /k "cd /d %~dp0 && echo Frontend Server Starting... && npm run dev"
echo Frontend server starting on http://localhost:5173
echo.

REM Wait for servers to initialize
echo Waiting for servers to initialize...
timeout /t 8 /nobreak

REM Open browser
echo Opening EcoShare in your browser...
start http://localhost:5173

echo.
echo ========================================
echo   EcoShare is now running!
echo   Backend: http://localhost:3000
echo   Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
