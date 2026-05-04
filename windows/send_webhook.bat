@echo off
set /p USER_MSG="Enter message to send: "

:: Use localhost if networkingMode=mirrored is enabled in .wslconfig
set TARGET_URL=http://localhost:3000/webhook

echo Sending Webhook to %TARGET_URL%...

curl -X POST -H "Content-Type: application/json" ^
     -d "{\"message\": \"%USER_MSG%\"}" ^
     %TARGET_URL%

if %errorlevel% neq 0 (
    echo [ERROR] Failed to send webhook.
) else (
    echo.
    echo [SUCCESS] Message sent.
)
pause
