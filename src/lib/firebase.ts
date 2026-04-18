import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAC3u5Riz99yJ348eV7LhFBJ7eQ0T2wTjU",
  authDomain: "fb-link-dashboard.firebaseapp.com",
  projectId: "fb-link-dashboard",
  storageBucket: "fb-link-dashboard.firebasestorage.app",
  messagingSenderId: "362908283215",
  appId: "1:362908283215:web:3220a87d84269b5bf7553a",
  measurementId: "G-ECJQWQZMDK"
};

// Initialize Firebase (this prevents errors during local development reloads)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };