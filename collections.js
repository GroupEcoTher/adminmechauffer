import * as admin from 'firebase-admin';
import serviceAccount from './path/to/your/serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://<me-chauffer>.firebaseio.com" // Remplacez <YOUR_PROJECT_ID> par l'ID de votre projet
});

let db = admin.firestore();

async function listAllCollections() {
  const collections = await db.listCollections();
  collections.forEach((collection) => {
    console.log('Collection ID:', collection.id);
  });
}

listAllCollections();
