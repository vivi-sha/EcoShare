@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    EcoShare Startup Script
echo ========================================
echo.

REM Get the directory of the script without the trailing backslash
set "BASE_DIR=%~dp0"
if "%BASE_DIR:~-1%"=="\" set "BASE_DIR=%BASE_DIR:~0,-1%"

REM Kill any existing Node.js and Vite processes
echo Stopping any existing EcoShare processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq EcoShare Backend*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq EcoShare Frontend*" /T >nul 2>&1
echo Done cleaning up old processes.
echo.

REM -------------------------------------------------
REM Ensure dependencies are installed
echo Checking dependencies...

IF NOT EXIST "%BASE_DIR%\node_modules" (
    echo [Frontend] node_modules missing. Installing...
    cd /d "%BASE_DIR%"
    call npm install
) ELSE (
    echo [Frontend] node_modules found.
)

IF NOT EXIST "%BASE_DIR%\server\node_modules" (
    echo [Backend] node_modules missing. Installing...
    cd /d "%BASE_DIR%\server"
    call npm install
) ELSE (
    echo [Backend] node_modules found.
)
REM -------------------------------------------------

REM Return to root
cd /d "%BASE_DIR%"

REM Wait a moment for ports to be released
timeout /t 2 /nobreak >nul

REM Start Backend Server
echo Starting EcoShare Backend Server...
start "EcoShare Backend" /D "%BASE_DIR%\server" cmd /k "echo Backend Server Starting... && node index.js"
echo Backend server starting on http://localhost:3000
echo.

REM Wait a moment before starting frontend
timeout /t 3 /nobreak >nul

REM Start Frontend Development Server
echo Starting EcoShare Frontend...
start "EcoShare Frontend" /D "%BASE_DIR%" cmd /k "echo Frontend Server Starting... && npm run dev"
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
