import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvlmN_nmlLq1HLodUPbmAQe029ta_nSQc",
  authDomain: "organize-34843.firebaseapp.com",
  projectId: "organize-34843",
  storageBucket: "organize-34843.firebasestorage.app",
  messagingSenderId: "942717322665",
  appId: "1:942717322665:web:d111e13a83132f6f4170b8",
  measurementId: "G-4N9LVLZE1T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
