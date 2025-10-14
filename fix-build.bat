@echo off
echo Fixing React Native build issues...

echo.
echo Step 1: Killing all Java processes to release file locks...
taskkill /f /im java.exe >nul 2>&1

echo.
echo Step 2: Stopping Gradle daemons...
cd android
call gradlew --stop >nul 2>&1
cd ..

echo.
echo Step 3: Forcefully removing corrupted Gradle cache...
echo This may take a few minutes...
rd /s /q "%USERPROFILE%\.gradle\caches" >nul 2>&1
rd /s /q "%USERPROFILE%\.gradle\daemon" >nul 2>&1
rd /s /q "%USERPROFILE%\.gradle\wrapper" >nul 2>&1

echo.
echo Step 4: Cleaning project (this may recreate some cache)...
cd android
call gradlew clean >nul 2>&1
cd ..

echo.
echo Step 5: Backing up problematic patch...
if exist "patches\react-native-gesture-handler+2.6.2.patch" (
    move "patches\react-native-gesture-handler+2.6.2.patch" "react-native-gesture-handler+2.6.2.patch.backup" >nul 2>&1
    echo Patch file backed up
)

echo.
echo Step 6: Clearing npm cache...
npm cache clean --force

echo.
echo Step 7: Reinstalling dependencies...
del /q /s node_modules >nul 2>&1
rmdir /s /q node_modules >nul 2>&1
npm install

echo.
echo Step 8: Clearing React Native cache...
npx react-native-clean-project --remove-iOS-build --remove-iOS-pods --remove-android-build --remove-android-clean-build --remove-react-native-cache --remove-npm-cache --remove-yarn-cache --remove-metro-cache --remove-haste-cache --remove-watchman-cache

echo.
echo Step 9: Building the project...
npm run android

echo.
echo Build process completed!
pause