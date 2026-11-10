import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDkD1XSG6j3nV88wCIEKot68uIRdFhUg8Y",
    authDomain: "wearexchange-cb42f.firebaseapp.com",
    projectId: "wearexchange-cb42f",
    storageBucket: "wearexchange-cb42f.firebasestorage.app",
    messagingSenderId: "679415155622",
    appId: "1:679415155622:web:0093ac5933d15968775d67"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();