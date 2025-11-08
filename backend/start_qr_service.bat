@echo off
REM Start QR Code Generation Service for Windows

echo Starting QR Code Generation Service...
echo Make sure you have installed Python dependencies: pip install -r requirements.txt
echo.

python qr_service.py

pause

