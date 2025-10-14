# Add project configuration to android/app/build.gradle

# 1. Add the Google services plugin to the bottom of your android/app/build.gradle file:
apply plugin: 'com.google.gms.google-services'

# 2. Add the Google services classpath to your android/build.gradle file:
# In the dependencies section, add:
classpath 'com.google.gms:google-services:4.3.15'

# 3. Download google-services.json from Firebase Console and place it in:
# android/app/google-services.json

# 4. Ensure these dependencies are in android/app/build.gradle:
implementation platform('com.google.firebase:firebase-bom:32.2.2')
implementation 'com.google.firebase:firebase-analytics'
implementation 'com.google.firebase:firebase-auth'
implementation 'com.google.firebase:firebase-firestore'
implementation 'com.google.firebase:firebase-storage'

# Note: You'll need to create a Firebase project and download the actual google-services.json file
# from the Firebase Console (https://console.firebase.google.com)
# Then replace the placeholder config in src/services/firebase/config.ts with your actual values