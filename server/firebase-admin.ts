// server/firebase-admin.ts
// Configuration pour Firebase Admin SDK (Côté Serveur)
// À utiliser si vous souhaitez basculer la messagerie sur Firestore à l'avenir.

import * as admin from 'firebase-admin';

// Pour initialiser Firebase Admin, vous devez fournir les credentials
// via une variable d'environnement contenant le JSON du compte de service.
// Exemple: FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."}'

export const initFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (serviceAccountJson) {
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          // databaseURL: "https://<DATABASE_NAME>.firebaseio.com" // Si utilisation de Realtime DB
        });
        console.log('Firebase Admin initialisé avec succès.');
      } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY non définie. Firebase Admin non initialisé.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Firebase Admin:', error);
    }
  }
  return admin;
};

// Export de l'instance db (Firestore) pour utilisation dans les routes
export const getFirestoreDb = () => {
  if (!admin.apps.length) {
    initFirebaseAdmin();
  }
  return admin.apps.length ? admin.firestore() : null;
};
