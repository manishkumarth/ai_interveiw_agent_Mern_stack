
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "aiinterviewagent-2a35f.firebaseapp.com",
  projectId: "aiinterviewagent-2a35f",
  storageBucket: "aiinterviewagent-2a35f.firebasestorage.app",
  messagingSenderId: "106052624671",
  appId: "1:106052624671:web:a12b6d34c8f292e811902a"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export { auth, provider }