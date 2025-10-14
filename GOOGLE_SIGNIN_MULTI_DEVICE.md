# 🔑 Fix Google Authentication on Different Laptops/Devices

## ❌ Problem

When you open your project on another laptop, Google Sign-in shows an error because:
- Each computer generates different **debug keystore SHA-1 fingerprints**
- Firebase only recognizes SHA-1 fingerprints you've registered
- The new laptop has a different debug keystore

---

## ✅ Solution: Add SHA-1 from All Devices to Firebase

You need to add the SHA-1 certificate fingerprint from **every computer** you develop on.

---

## 🚀 Step-by-Step Fix

### Step 1: Get SHA-1 from the New Laptop

On the **new laptop** where Google Sign-in is failing, run:

#### Option A: Using Gradle (Recommended)
```powershell
cd android
.\gradlew signingReport
```

Look for output like:
```
Variant: debug
Config: debug
Store: C:\Users\YourName\.android\debug.keystore
Alias: androiddebugkey
MD5: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
SHA1: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12
SHA-256: ...
```

**Copy the SHA1 value** (the long hexadecimal string after "SHA1:")

#### Option B: Using Keytool
```powershell
keytool -list -v -keystore C:\Users\YourName\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Replace `YourName` with your Windows username.

Look for:
```
Certificate fingerprint (SHA1): AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12
```

---

### Step 2: Add SHA-1 to Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/

2. **Select your project**: `lifeband-maa`

3. **Go to Project Settings**:
   - Click the gear icon (⚙️) at top-left
   - Click "Project Settings"

4. **Select your Android app**:
   - Scroll down to "Your apps" section
   - Click on your Android app (`com.lifebandmaa`)

5. **Add the SHA-1 fingerprint**:
   - Scroll down to "SHA certificate fingerprints" section
   - Click "Add fingerprint"
   - Paste the SHA1 value you copied
   - Click "Save"

---

### Step 3: Download Updated google-services.json

1. **In Firebase Console**, after adding SHA-1:
   - Still in Project Settings → Your Apps → Android app
   - Click "Download google-services.json"

2. **Replace the file**:
   - Delete old `android/app/google-services.json`
   - Copy the new downloaded file to `android/app/google-services.json`

---

### Step 4: Clean and Rebuild

```powershell
# Clean the project
cd android
.\gradlew clean
cd ..

# Rebuild and run
npm run android
```

---

## 🔧 Quick Fix Script

Save this as `get-sha1.ps1`:

```powershell
# Get SHA-1 for Google Sign-in Setup
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Getting SHA-1 Fingerprint" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Method 1: Using Gradle
Write-Host "Method 1: Using Gradle (Recommended)" -ForegroundColor Yellow
Write-Host "Running: .\gradlew signingReport" -ForegroundColor Gray
Write-Host ""

Set-Location android
.\gradlew signingReport | Select-String -Pattern "SHA1:", "SHA-1:"

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Copy the SHA1 value above!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy the SHA1 value (the long hex string)" -ForegroundColor White
Write-Host "2. Go to Firebase Console: https://console.firebase.google.com/" -ForegroundColor White
Write-Host "3. Project Settings → Your Apps → Add Fingerprint" -ForegroundColor White
Write-Host "4. Paste SHA1 and save" -ForegroundColor White
Write-Host "5. Download updated google-services.json" -ForegroundColor White
Write-Host "6. Replace android/app/google-services.json" -ForegroundColor White
Write-Host ""

Set-Location ..
```

Run it with:
```powershell
.\get-sha1.ps1
```

---

## 🎯 For Multiple Developers/Laptops

If you have a team or use multiple computers, you need SHA-1 from:

### Debug Keystores (Development):
- ✅ Laptop 1 debug keystore
- ✅ Laptop 2 debug keystore
- ✅ Laptop 3 debug keystore
- ✅ Android Studio on each machine
- ✅ Each developer's machine

### Release Keystore (Production):
- ✅ Your production keystore SHA-1 (already done)
  - Location: `android/app/lifeband-release.keystore`

---

## 📍 SHA-1 Already in Your Firebase

Currently registered (from your google-services.json):
```
certificate_hash: "5dd570a3f5f5f4e78fa4aecd0d157fe9f482c9df"
```

This is from **one** machine. You need to add SHA-1 from the **new laptop**.

---

## 🔍 Get SHA-1 for Different Keystores

### For Debug Keystore (Development):
```powershell
# Windows
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android

# Or using Gradle
cd android
.\gradlew signingReport
```

### For Release Keystore (Production):
```powershell
keytool -list -v -keystore android\app\lifeband-release.keystore -alias lifeband-key -storepass Life-band@2025 -keypass Life-band@2025
```

---

## ✅ Verification Steps

After adding SHA-1 and updating google-services.json:

1. **Clean build**:
   ```powershell
   cd android
   .\gradlew clean
   cd ..
   ```

2. **Rebuild app**:
   ```powershell
   npm run android
   ```

3. **Test Google Sign-in**:
   - Open app
   - Try to sign in with Google
   - Should work now! ✅

---

## 🐛 Common Errors & Solutions

### Error: "Developer Error" or "10: 10"
**Cause**: SHA-1 not registered in Firebase
**Fix**: Add SHA-1 from current machine to Firebase Console

### Error: "Sign in failed"
**Cause**: google-services.json not updated after adding SHA-1
**Fix**: Re-download google-services.json from Firebase and replace

### Error: "No client with package name"
**Cause**: Package name mismatch
**Fix**: Verify package name in google-services.json matches `com.lifebandmaa`

### Error: Google Sign-in works on one PC but not another
**Cause**: Different debug keystores on each PC
**Fix**: Get SHA-1 from both PCs and add both to Firebase

---

## 📝 Best Practice

### For Development:
Add SHA-1 from **all developer machines** to Firebase Console

### For Production:
Add SHA-1 from your **production release keystore**:
```powershell
keytool -list -v -keystore android\app\lifeband-release.keystore -alias lifeband-key
```

---

## 🚀 Quick Summary

**Problem**: Google Sign-in not working on new laptop  
**Cause**: Different SHA-1 fingerprint  
**Solution**: 
1. Get SHA-1 from new laptop: `cd android; .\gradlew signingReport`
2. Add to Firebase Console
3. Download new google-services.json
4. Replace old file
5. Clean & rebuild

**Time needed**: 5-10 minutes

---

## 📞 Need Help?

If still not working:

1. **Check package name**:
   - `android/app/build.gradle` → applicationId: "com.lifebandmaa"
   - Must match Firebase

2. **Check google-services.json**:
   - Must be in `android/app/google-services.json`
   - Must have latest SHA-1

3. **Check logs**:
   ```powershell
   adb logcat | Select-String "GoogleSignIn"
   ```

---

**After following these steps, Google Sign-in will work on the new laptop!** ✅
