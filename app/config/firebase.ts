import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCamU9jv55QRhSPAcxVsT9JafXp9FiqEIM",
  authDomain: "intercambio-548ec.firebaseapp.com",
  projectId: "intercambio-548ec",
  storageBucket: "intercambio-548ec.firebasestorage.app",
  messagingSenderId: "7268380927",
  appId: "1:7268380927:web:695a1526f677b18aee5cca",
  measurementId: "G-ZX1SXD4XBB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
