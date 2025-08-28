// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQUXe1T3d508ivXaUfvYz45V6Ntrbb8o8",
  authDomain: "finance-tracker-b14af.firebaseapp.com",
  projectId: "finance-tracker-b14af",
  storageBucket: "finance-tracker-b14af.firebasestorage.app",
  messagingSenderId: "106229264569",
  appId: "1:106229264569:web:ee7a08f8449ad8a11c6b68",
  measurementId: "G-2YNM45M3F8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export {collection, addDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot};

export default app;
