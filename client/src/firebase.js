// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "opendoorway-f305a.firebaseapp.com",
  projectId: "opendoorway-f305a",
  storageBucket: "opendoorway-f305a.appspot.com",
  messagingSenderId: "829604360836",
  appId: "1:829604360836:web:d36e15817b7d5a45a808d1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);