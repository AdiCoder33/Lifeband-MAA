# 🚨 QUICK FIX: Google Sign-in Not Working on New Laptop

## Problem
Google Authentication shows error on different laptop/Android Studio

## Root Cause
Each computer has a different **debug keystore** with different SHA-1 fingerprint.  
Firebase needs to know SHA-1 from **all** computers you develop on.

---

## ⚡ 5-Minute Fix

### Step 1: Get SHA-1 from Current Laptop (2 min)

**Run this script:**
```powershell
.\get-sha1.ps1
```

**OR manually:**
```powershell
cd android
.\gradlew signingReport
```

**Look for output like:**
```
Variant: debug
SHA1: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12
```

**Copy the SHA1 value** (the long string after "SHA1:")

---

### Step 2: Add to Firebase (2 min)

1. **Open**: https://console.firebase.google.com/
2. **Select project**: `lifeband-maa`
3. **Click**: Gear icon ⚙️ → "Project Settings"
4. **Scroll down** to "Your apps" section
5. **Click** on Android app (com.lifebandmaa)
6. **Scroll to**: "SHA certificate fingerprints"
7. **Click**: "Add fingerprint"
8. **Paste**: Your SHA1 value
9. **Click**: "Save"

---

### Step 3: Update google-services.json (1 min)

1. **In Firebase Console**, still on the same page
2. **Click**: "Download google-services.json" button
3. **Replace** the file:
   - Delete: `android\app\google-services.json`
   - Copy new file to: `android\app\google-services.json`

---

### Step 4: Clean & Rebuild (1 min)

```powershell
cd android
.\gradlew clean
cd ..
npm run android
```

---

## ✅ Done!

Google Sign-in will now work on this laptop!

---

## 🔄 For Every New Laptop/Computer

Repeat these 4 steps on **each** new computer you develop on.

**Why?** Each computer has a different debug keystore, so each needs its SHA-1 registered in Firebase.

---

## 📊 SHA-1 Fingerprints You Need

### Development (Debug Mode):
- ✅ Laptop 1 SHA-1
- ✅ Laptop 2 SHA-1 ← **Add this one now!**
- ✅ Any other developer's laptop

### Production (Release Mode):
- ✅ Release keystore SHA-1 (already added)
  - File: `android\app\lifeband-release.keystore`

**You can have multiple SHA-1 fingerprints in Firebase** - one for each development machine + production keystore.

---

## 🎯 Visual Steps

```
┌─────────────────────────────────────────────┐
│  Step 1: Get SHA-1 from Current Laptop      │
│  Command: cd android; .\gradlew signingReport│
│  Copy: SHA1: XX:XX:XX:...                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Step 2: Open Firebase Console              │
│  URL: console.firebase.google.com           │
│  Add SHA-1 fingerprint                       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Step 3: Download google-services.json      │
│  Replace in: android\app\                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Step 4: Clean & Rebuild                    │
│  Commands: gradlew clean → npm run android  │
└─────────────────────────────────────────────┘
                    ↓
              ✅ WORKING!
```

---

## 🐛 Still Not Working?

### Check 1: Package Name
```powershell
# In android\app\build.gradle
applicationId "com.lifebandmaa"
```
Must match Firebase project package name.

### Check 2: google-services.json Location
Must be at: `android\app\google-services.json` (not `android\google-services.json`)

### Check 3: SHA-1 Added?
- Go to Firebase Console
- Project Settings → Your Apps → Android
- Check if your SHA-1 is listed

### Check 4: Logs
```powershell
adb logcat | Select-String "GoogleSignIn"
```
Look for specific error messages.

---

## 💡 Pro Tip

**Save SHA-1 for each laptop:**

Create a file `SHA1_FINGERPRINTS.txt`:
```
Laptop 1 (Main): AB:CD:EF:12:34:...
Laptop 2 (Office): 12:34:56:78:90:...
Release Keystore: XX:YY:ZZ:AA:BB:...
```

This helps track which SHA-1 belongs to which machine.

---

## ✅ Summary

**Problem**: Google auth error on new laptop  
**Cause**: Different debug keystore SHA-1  
**Fix**: Add new laptop's SHA-1 to Firebase  
**Time**: 5 minutes  
**Result**: Google Sign-in works everywhere! ✅

---

**Run `.\get-sha1.ps1` now to get started!** 🚀
