# Build Production APK Script
# This script builds a production-ready APK for distribution

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Building Production APK" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if keystore exists
$keystorePath = "android\app\lifeband-release.keystore"
if (-not (Test-Path $keystorePath)) {
    Write-Host "ERROR: Release keystore not found!" -ForegroundColor Red
    Write-Host "Please run setup-production.ps1 first to create the keystore." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✓ Keystore found" -ForegroundColor Green
Write-Host ""

# Clean previous builds
Write-Host "Step 1: Cleaning previous builds..." -ForegroundColor Yellow
Set-Location android
.\gradlew clean
Set-Location ..
Write-Host "✓ Clean complete" -ForegroundColor Green
Write-Host ""

# Build release APK
Write-Host "Step 2: Building release APK..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

Set-Location android
.\gradlew assembleRelease

if ($LASTEXITCODE -eq 0) {
    Set-Location ..
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "SUCCESS! APK Built!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    
    $apkPath = "android\app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $apkSize = [math]::Round((Get-Item $apkPath).Length / 1MB, 2)
        Write-Host "APK Location:" -ForegroundColor Cyan
        Write-Host "  $apkPath" -ForegroundColor White
        Write-Host ""
        Write-Host "APK Size: $apkSize MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "NEXT STEPS:" -ForegroundColor Yellow
        Write-Host "1. Test the APK:" -ForegroundColor White
        Write-Host "   adb install $apkPath" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Or copy the APK to your phone and install manually" -ForegroundColor White
        Write-Host ""
        Write-Host "3. Share with others:" -ForegroundColor White
        Write-Host "   - Send via WhatsApp, Email, or Google Drive" -ForegroundColor Gray
        Write-Host "   - Recipients need to enable 'Install from Unknown Sources'" -ForegroundColor Gray
        Write-Host ""
        
        # Open folder
        Write-Host "Open APK folder? (yes/no): " -ForegroundColor Yellow -NoNewline
        $openFolder = Read-Host
        if ($openFolder -eq "yes" -or $openFolder -eq "y") {
            explorer.exe "android\app\build\outputs\apk\release"
        }
    }
} else {
    Set-Location ..
    Write-Host ""
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Check if passwords in gradle.properties are correct" -ForegroundColor White
    Write-Host "2. Make sure keystore file exists in android/app/" -ForegroundColor White
    Write-Host "3. Check the error messages above for details" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
