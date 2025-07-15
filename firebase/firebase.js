// firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDvi3VloZ6zNcVtGGQ96Q17QRDehgqZFGg",
  authDomain: "restaurante-9f5bd.firebaseapp.com",
  projectId: "restaurante-9f5bd",
  storageBucket: "restaurante-9f5bd.appspot.com",
  messagingSenderId: "65909624724",
  appId: "1:65909624724:web:203a81e2545f8390858981",
  measurementId: "G-NWJ32347J6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
