# Lifeband MAA - Production Setup Script
# This script helps you generate a release keystore for production builds

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Lifeband MAA - Production Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-Location android\app

Write-Host "Step 1: Generating Release Keystore..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: You will be asked for:" -ForegroundColor Green
Write-Host "  1. Keystore password (remember this!)" -ForegroundColor White
Write-Host "  2. Key password (can be same as keystore)" -ForegroundColor White
Write-Host "  3. Your name, organization, city, state, country" -ForegroundColor White
Write-Host ""

$keystoreExists = Test-Path "lifeband-release.keystore"
if ($keystoreExists) {
    Write-Host "WARNING: Keystore already exists!" -ForegroundColor Red
    $overwrite = Read-Host "Do you want to overwrite it? (yes/no)"
    if ($overwrite -ne "yes") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        Set-Location ..\..
        exit
    }
    Remove-Item "lifeband-release.keystore" -Force
}

try {
    keytool -genkeypair -v -storetype PKCS12 -keystore lifeband-release.keystore -alias lifeband-key -keyalg RSA -keysize 2048 -validity 10000

    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "SUCCESS! Keystore Created!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Location: android\app\lifeband-release.keystore" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Update android\gradle.properties with your passwords:" -ForegroundColor White
    Write-Host "   - MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password" -ForegroundColor Gray
    Write-Host "   - MYAPP_RELEASE_KEY_PASSWORD=your_key_password" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Build your release APK:" -ForegroundColor White
    Write-Host "   npm run build:android" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Find your APK at:" -ForegroundColor White
    Write-Host "   android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Back up your keystore file and passwords!" -ForegroundColor Red
    Write-Host "    You'll need them for all future updates." -ForegroundColor Red
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "ERROR: Failed to create keystore!" -ForegroundColor Red
    Write-Host "Make sure you have Java JDK installed." -ForegroundColor Yellow
    Write-Host "Error details: $_" -ForegroundColor Gray
}

Set-Location ..\..
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
