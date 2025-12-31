@echo off
echo Starting EcoShare Backend...
start "EcoShare Backend" cmd /k "cd server && node index.js"

echo Starting EcoShare Frontend...
start "EcoShare Frontend" cmd /k "npm run dev"

echo EcoShare is starting! Please wait for the browser to open...
timeout /t 5
start http://localhost:5173
echo Done.
