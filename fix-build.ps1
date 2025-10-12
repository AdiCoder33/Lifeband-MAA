# Fix Build Issues - PowerShell Version

Write-Host "Fixing React Native build issues..." -ForegroundColor Green

Write-Host "`nStep 1: Stopping Gradle daemons..." -ForegroundColor Yellow
Set-Location android
./gradlew --stop
Set-Location ..

Write-Host "`nStep 2: Cleaning project..." -ForegroundColor Yellow
Set-Location android
./gradlew clean
Set-Location ..

Write-Host "`nStep 3: Backing up problematic patch..." -ForegroundColor Yellow
if (Test-Path "patches\react-native-gesture-handler+2.6.2.patch") {
    Move-Item "patches\react-native-gesture-handler+2.6.2.patch" "react-native-gesture-handler+2.6.2.patch.backup" -Force
    Write-Host "Patch file backed up" -ForegroundColor Green
}

Write-Host "`nStep 4: Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "`nStep 5: Reinstalling dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force
}
npm install

Write-Host "`nStep 6: Clearing React Native cache..." -ForegroundColor Yellow
npx react-native-clean-project --remove-iOS-build --remove-android-build

Write-Host "`nStep 7: Building the project..." -ForegroundColor Yellow
npm run android

Write-Host "`nBuild process completed!" -ForegroundColor Green