import Constants from 'expo-constants';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId,
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export async function registerWithFirebase(email: string, password: string) {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('YOUR_')) {
    throw new Error('Add your Firebase config in app.json extra before using Firebase auth.');
  }

  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function loginWithFirebase(email: string, password: string) {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('YOUR_')) {
    throw new Error('Add your Firebase config in app.json extra before using Firebase auth.');
  }

  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function logoutFromFirebase() {
  await signOut(auth);
}

export { auth, firebaseApp };
