import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDZD1jRgAfvpDuKpr9y-BSahmtHVb6Y8oU",
  authDomain: "type-and-slash-game.firebaseapp.com",
  projectId: "type-and-slash-game",
  storageBucket: "type-and-slash-game.firebasestorage.app",
  messagingSenderId: "898114139190",
  appId: "1:898114139190:web:9b7adeb1a582c84c821497"
};

// ↓ この行が抜けている可能性が高いです
export const GAME_APP_ID = "type-and-slash-v1";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);