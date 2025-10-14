# Get SHA-1 Fingerprint for Google Sign-in Setup
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Getting SHA-1 Fingerprint" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking for keystores..." -ForegroundColor Yellow
Write-Host ""

# Check if in project root
if (-not (Test-Path "android\app\build.gradle")) {
    Write-Host "ERROR: Not in project root directory!" -ForegroundColor Red
    Write-Host "Please run this script from the project root folder." -ForegroundColor Yellow
    pause
    exit 1
}

# Get SHA-1 using Gradle
Write-Host "Getting SHA-1 using Gradle..." -ForegroundColor Yellow
Write-Host ""

Set-Location android

try {
    Write-Host "Debug Keystore SHA-1:" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Cyan
    $gradleOutput = .\gradlew signingReport 2>&1 | Out-String
    
    # Extract SHA1 for debug
    $sha1Lines = $gradleOutput -split "`n" | Select-String -Pattern "SHA1:" -Context 0,0
    
    if ($sha1Lines) {
        foreach ($line in $sha1Lines) {
            if ($line -match "SHA1:\s*([A-F0-9:]+)") {
                $sha1 = $matches[1]
                Write-Host "SHA1: $sha1" -ForegroundColor Green
                Write-Host ""
                
                # Copy to clipboard
                $sha1 | Set-Clipboard
                Write-Host "✓ Copied to clipboard!" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "SHA1 not found in output. Full output:" -ForegroundColor Yellow
        Write-Host $gradleOutput -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Release Keystore SHA-1:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    if (Test-Path "app\lifeband-release.keystore") {
        Write-Host "Checking release keystore..." -ForegroundColor Yellow
        
        # Try to find keytool
        $keytool = $null
        
        # Check common locations
        $javaHome = $env:JAVA_HOME
        if ($javaHome -and (Test-Path "$javaHome\bin\keytool.exe")) {
            $keytool = "$javaHome\bin\keytool.exe"
        } else {
            # Search for keytool
            $keytoolPath = Get-ChildItem -Path "C:\Program Files\Java" -Recurse -Filter "keytool.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($keytoolPath) {
                $keytool = $keytoolPath.FullName
            }
        }
        
        if ($keytool) {
            Write-Host "Enter your release keystore password: " -ForegroundColor Yellow -NoNewline
            $password = Read-Host -AsSecureString
            $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
            
            $releaseOutput = & $keytool -list -v -keystore "app\lifeband-release.keystore" -alias lifeband-key -storepass $plainPassword -keypass $plainPassword 2>&1 | Out-String
            
            if ($releaseOutput -match "SHA1:\s*([A-F0-9:]+)") {
                $releaseSha1 = $matches[1]
                Write-Host "Release SHA1: $releaseSha1" -ForegroundColor Green
            } else {
                Write-Host "Could not get release SHA1. Check password." -ForegroundColor Red
            }
        } else {
            Write-Host "keytool not found. Install Java JDK." -ForegroundColor Red
        }
    } else {
        Write-Host "Release keystore not found yet." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Set-Location ..

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Copy the SHA1 value above (already in clipboard!)" -ForegroundColor White
Write-Host ""
Write-Host "2. Go to Firebase Console:" -ForegroundColor White
Write-Host "   https://console.firebase.google.com/" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Select Project: lifeband-maa" -ForegroundColor White
Write-Host ""
Write-Host "4. Go to Project Settings (gear icon)" -ForegroundColor White
Write-Host ""
Write-Host "5. Scroll down to 'Your apps' → Select Android app" -ForegroundColor White
Write-Host ""
Write-Host "6. Scroll to 'SHA certificate fingerprints'" -ForegroundColor White
Write-Host ""
Write-Host "7. Click 'Add fingerprint'" -ForegroundColor White
Write-Host ""
Write-Host "8. Paste the SHA1 value and click Save" -ForegroundColor White
Write-Host ""
Write-Host "9. Download the new google-services.json" -ForegroundColor White
Write-Host ""
Write-Host "10. Replace android\app\google-services.json" -ForegroundColor White
Write-Host ""
Write-Host "11. Clean and rebuild:" -ForegroundColor White
Write-Host "    cd android; .\gradlew clean; cd .." -ForegroundColor Cyan
Write-Host "    npm run android" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
