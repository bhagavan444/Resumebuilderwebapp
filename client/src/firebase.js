// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-yRCxvhWLiXfetd9_pxNNwYezEtuc410",
  authDomain: "resumebuiderapp.firebaseapp.com",
  projectId: "resumebuiderapp",
  storageBucket: "resumebuiderapp.appspot.com",
  messagingSenderId: "968938464579",
  appId: "1:968938464579:web:ed574db474abd8c4d07bf6",
  measurementId: "G-N4KR87VX1Z"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const firebaseApp = app;