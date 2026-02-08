@echo off
title Allentines Loader
color 0d

echo.
echo    My Rapunzel,
echo    Starting your special gift...
echo.
echo    (If this window closes instantly or shows an error, please read HOW_TO_START.txt)
echo.

:: Check if Node is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo    [ERROR] Node.js is not installed!
    echo    Please ask your Flynn to help you install it, or read HOW_TO_START.txt
    echo.
    pause
    exit
)

echo    [1/2] Preparing magic... (Installing dependencies)
call npm install --silent

echo    [2/2] Opening the lantern... (Starting App)
:: --open flag tells Vite to open the default browser
call npm run dev -- --open

pause
