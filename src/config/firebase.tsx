// src/config/firebase.tsx
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocs} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import 'firebase/compat/database';
import { collection } from 'firebase/firestore';



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAJuCAWruOL5yBF3L7JXcTNTBReSA7lRAY',
  authDomain: 'mechauffernext.firebaseapp.com',
  projectId: 'mechauffernext',
  storageBucket: 'mechauffernext.appspot.com',
  messagingSenderId: '336346984646',
  appId: '1:336346984646:web:00b5f78bbf7aa4225c27c7',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const appSecond = initializeApp(firebaseConfig, 'Secondary');

export const db = getFirestore(app);
export const auth = getAuth(app);
export const authSecond = getAuth(appSecond);
export const storage = getStorage(app);
export { app, appSecond };


export const getData = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const users: { id: string; }[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  console.log(users);
  return users;
}

// Obtient tous les utilisateurs
export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  console.log("Nombre total d'utilisateurs: ", querySnapshot.size);
  const users: { id: string; }[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  return users;
};

export const getIncompleteUsers  = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const users: never[] = [];
  return users;
};

export default firebaseConfig;