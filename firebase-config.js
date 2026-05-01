// ============================================================
//  STEP 1: Paste your Firebase project config object below
//  Get it from: Firebase Console → Project Settings → Your Apps
// ============================================================

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlev6lgVZPAIUIUa9dXts5fOaAV9K6jds",
  authDomain: "oood-ea29f.firebaseapp.com",
  projectId: "oood-ea29f",
  storageBucket: "oood-ea29f.firebasestorage.app",
  messagingSenderId: "491605405130",
  appId: "1:491605405130:web:16d9dcc2ce750d8fabf333",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
