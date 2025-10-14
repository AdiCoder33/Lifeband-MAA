import app from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage, { FirebaseStorageTypes } from '@react-native-firebase/storage';

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCsfokUXPPeZjiQMckrWjQs--uqm6FNXMA",
  authDomain: "lifeband-maa.firebaseapp.com",
  projectId: "lifeband-maa",
  storageBucket: "lifeband-maa.firebasestorage.app",
  messagingSenderId: "280198393441",
  appId: "1:280198393441:android:79721949b2f9a0bc258420"
};

// Firebase services - using modern API
export const FirebaseAuth = () => auth();
export const FirebaseFirestore = () => firestore();
export const FirebaseStorage = () => storage();

// Type exports for better TypeScript support
export type User = FirebaseAuthTypes.User;
export type DocumentSnapshot = FirebaseFirestoreTypes.DocumentSnapshot;
export type QuerySnapshot = FirebaseFirestoreTypes.QuerySnapshot;
export type DocumentReference = FirebaseFirestoreTypes.DocumentReference;
export type CollectionReference = FirebaseFirestoreTypes.CollectionReference;

// Collections
export const Collections = {
  USERS: 'users',
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  ASHA_WORKERS: 'ashaWorkers',
  HEALTH_READINGS: 'healthReadings',
  APPOINTMENTS: 'appointments',
  MEDICATIONS: 'medications',
  NUTRITION_PLANS: 'nutritionPlans',
  EXERCISE_ROUTINES: 'exerciseRoutines',
  BABY_DEVELOPMENT: 'babyDevelopment',
  EMERGENCY_CONTACTS: 'emergencyContacts',
  MATERNAL_VISITS: 'maternalVisits',
  HEALTH_EDUCATION: 'healthEducation',
  VACCINATION_RECORDS: 'vaccinationRecords'
} as const;

export default {
  auth,
  firestore,
  storage,
  Collections
};