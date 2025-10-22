// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCamU9jv55QRhSPAcxVsT9JafXp9FiqEIM",
  authDomain: "intercambio-548ec.firebaseapp.com",
  projectId: "intercambio-548ec",
  storageBucket: "intercambio-548ec.firebasestorage.app",
  messagingSenderId: "7268380927",
  appId: "1:7268380927:web:695a1526f677b18aee5cca",
  measurementId: "G-ZX1SXD4XBB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;