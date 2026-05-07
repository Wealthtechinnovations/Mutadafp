// src/services/firebase.ts
// Configuration pour Firebase Client SDK (Côté Client)
// À utiliser si vous souhaitez basculer la messagerie sur Firestore à l'avenir.

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase à partir des variables d'environnement
// Ne jamais hardcoder les clés ici.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialisation de Firebase uniquement si la configuration est présente
let app;
let db;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('Firebase Client initialisé avec succès.');
  } else {
    console.warn('Configuration Firebase manquante. Firebase Client non initialisé.');
  }
} catch (error) {
  console.error('Erreur lors de l\'initialisation de Firebase Client:', error);
}

export { app, db };
