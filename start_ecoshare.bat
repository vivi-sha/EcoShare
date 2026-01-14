@echo off
SETLOCAL EnableDelayedExpansion

title EcoShare 2.0 - Dashboard
color 0B

echo ========================================================
echo         🌿 EcoShare 2.0 - Smart Travel Manager 🌿
echo ========================================================
echo.

REM Set current directory to script location
pushd "%~dp0"

REM --- CLEANUP ---
echo [1/4] Cleaning up old sessions...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 1 /nobreak >nul
echo Done.
echo.

REM --- DEPENDENCY CHECK ---
echo [2/4] Checking for missing dependencies...
IF NOT EXIST "node_modules" (
    echo [!] Dependencies missing. Installing full-stack packages...
    call npm install --no-audit --no-fund
) ELSE (
    echo Dependencies found.
)
echo Done.
echo.

REM --- DB CHECK ---
echo [3/4] Checking MongoDB status...
net start | find "MongoDB" >nul
if %errorlevel% neq 0 (
    echo [!] WARNING: MongoDB service does not appear to be running locally.
    echo If the app fails to connect, please start your MongoDB server.
) else (
    echo MongoDB service detected.
)
echo.

REM --- START SERVICES ---
echo [4/4] Launching EcoShare Services...

REM Start Backend Server (on port 3000)
start "EcoShare API" cmd /c "title EcoShare Backend [Port 3000] && color 0E && echo Starting Backend... && node server/index.js"
echo Backend starting on http://localhost:3000

REM Start Frontend Development Server (on port 5173)
start "EcoShare Web" cmd /c "title EcoShare Frontend [Port 5173] && color 0A && echo Starting Frontend... && npm run dev"
echo Frontend starting on http://localhost:5173
echo.

REM --- FINALIZATION ---
echo ========================================================
echo ✨ System initialization complete!
echo.
echo Waiting 5 seconds for services to warm up...
timeout /t 5 /nobreak >nul

echo Opening EcoShare in your default browser...
start http://localhost:5173

echo.
echo ========================================================
echo ✅ SUCCESS: EcoShare is now running.
echo Keep this window open or press any key to close it.
echo.
echo TIP: You can see server logs in the new windows that opened.
echo ========================================================
pause >nul
popd
