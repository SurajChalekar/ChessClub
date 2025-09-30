// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-9OBRWK3IzuYTnE-56I-JAfVEDESLm0U",
  authDomain: "chessclub-66f16.firebaseapp.com",
  projectId: "chessclub-66f16",
  storageBucket: "chessclub-66f16.firebasestorage.app",
  messagingSenderId: "854988482205",
  appId: "1:854988482205:web:b1f2bb2fea3cc78e301674",
  measurementId: "G-WJZ0FKH1BQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account"
})
export { auth, provider };