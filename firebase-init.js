import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfwb09iGstv-NQvGna8U3uQR4L4HGX58Y",
  authDomain: "unoproject-d283e.firebaseapp.com",
  projectId: "unoproject-d283e",
  storageBucket: "unoproject-d283e.firebasestorage.app",
  messagingSenderId: "1007929065764",
  appId: "1:1007929065764:web:6292cd8300cd69c92cf3b1",
  measurementId: "G-TSWY6E21ZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Sign in anonymously
signInAnonymously(auth)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log('Signed in as:', user.uid);
  })
  .catch((error) => {
    console.error('Error signing in:', error);
  });

export { db, auth };