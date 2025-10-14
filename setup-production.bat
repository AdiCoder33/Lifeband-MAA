@echo off
echo ================================
echo Lifeband MAA - Production Setup
echo ================================
echo.

cd android\app

echo Step 1: Generating Release Keystore...
echo.
echo IMPORTANT: You will be asked for:
echo   1. Keystore password (remember this!)
echo   2. Key password (can be same as keystore)
echo   3. Your name, organization, etc.
echo.

keytool -genkeypair -v -storetype PKCS12 -keystore lifeband-release.keystore -alias lifeband-key -keyalg RSA -keysize 2048 -validity 10000

if errorlevel 1 (
    echo.
    echo ERROR: Failed to create keystore!
    echo Make sure you have Java JDK installed.
    pause
    exit /b 1
)

echo.
echo ================================
echo SUCCESS! Keystore Created!
echo ================================
echo.
echo Location: android\app\lifeband-release.keystore
echo.
echo NEXT STEPS:
echo 1. Update android\gradle.properties with your passwords:
echo    - MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
echo    - MYAPP_RELEASE_KEY_PASSWORD=your_key_password
echo.
echo 2. Build your release APK:
echo    npm run build:android
echo.
echo 3. Find your APK at:
echo    android\app\build\outputs\apk\release\app-release.apk
echo.
echo ⚠️  IMPORTANT: Back up your keystore file and passwords!
echo     You'll need them for all future updates.
echo.

cd ..\..
pause
