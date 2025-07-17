import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCp7H35BmfdoCOvbvtqXssCrNf3mhRbqmc",
  authDomain: "studio-1uekq.firebaseapp.com",
  projectId: "studio-1uekq",
  storageBucket: "studio-1uekq.firebasestorage.app",
  messagingSenderId: "985191008807",
  appId: "1:985191008807:web:aee41d452a6be210f31c02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
