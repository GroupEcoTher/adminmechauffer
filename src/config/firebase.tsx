// Importation des fonctions nécessaires des SDK Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail, updateEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  getAggregateFromServer,
  sum,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import moment from 'moment';

// Configuration de l'application Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAJuCAWruOL5yBF3L7JXcTNTBReSA7lRAY',
  authDomain: 'mechauffernext.firebaseapp.com',
  projectId: 'mechauffernext',
  storageBucket: 'mechauffernext.appspot.com',
  messagingSenderId: '336346984646',
  appId: '1:336346984646:web:00b5f78bbf7aa4225c27c7',
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const appSecond = initializeApp(firebaseConfig, 'Secondary');

// Exportation des services Firebase pour une utilisation dans d'autres fichiers
export const db = getFirestore(app);
export const auth = getAuth(app);
export const authSecond = getAuth(appSecond);
export const storage = getStorage(app);

// Fonction pour récupérer les adresses par ID utilisateur
export const getDataAdressebyUserID = async (user) => {
  const usersRef = collection(db, 'adresse');
  const q = query(usersRef, where('user', '==', user));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
};

// Fonction pour récupérer les demandes par ID utilisateur
export const getDataDemandesbyUserID = async (user) => {
  const dateInst = new Date();
  const usersRef = collection(db, 'demandes');
  const q = query(usersRef, where('user', '==', user), where('dateCreation', '<=', dateInst), orderBy('dateCreation', 'desc'));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
};

// Fonction pour récupérer les demandes par ID adresse
export const getDataDemandesbyAddresseID = async (add) => {
  const usersRef = collection(db, 'demandes');
  const q = query(usersRef, where('adresse', '==', add));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
};

// Fonction pour récupérer les gains XCP temporaires par token ID
export const getTempXcpByTokenID = async (Token) => {
  const usersRef = collection(db, 'demandes');
  const q = query(usersRef, where('tokenParrain', '==', Token), where('demandestatus', '==', 'En cours de traitement'), orderBy('XCPgain'));
  const querySnapshot = await getDocs(q);
  const snapshot = await getAggregateFromServer(q, {
    totalTempXcp: sum('XCPgain')
  });
  let res = [snapshot.data().totalTempXcp];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
};

// Fonction pour récupérer les gains XCP temporaires par token partenaire
export const getTempXcpByTokenPartenaire = async (user) => {
  const usersRef = collection(db, 'demandes');
  const q = query(usersRef, where('tokenParrain', '==', user.uid), where('demandestatus', '==', 'En cours de traitement'), orderBy('XCPgain'));
  const snapshot = await getAggregateFromServer(q, {
    totalTempXcp: sum('XCPgain')
  });
  const q2 = query(usersRef, where('tokenPartenaire', '==', user.mytoken), where('demandestatus', '==', 'En cours de traitement'), orderBy('XCPgainParte'));
  const snapshot2 = await getAggregateFromServer(q2, {
    totalTempXcp: sum('XCPgainParte')
  });

  const res = snapshot.data().totalTempXcp + snapshot2.data().totalTempXcp;
  return res;
};

// Fonction pour récupérer les utilisateurs par token ID
export const getUserParrainbyTokenID = async (Token) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('tokenParrain', '==', Token));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
};

// Fonction pour récupérer les parrains par token ID
export const getParrainbyTokenID = async (Token) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('tokenPartenaire', '==', Token));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
};

// Fonction pour créer un document utilisateur
export const createUserDocument = async (user, additionalData) => {
  if (!user) return;
  const { email } = user;
  try {
    const docRef = await setDoc(doc(db, 'users', user.uid), {
      dateCreation: serverTimestamp(),
      ...additionalData,
      email,
    });
    return docRef;
  } catch (e) {
    console.log('error : ', e);
  }
};

// Fonction pour ajouter un utilisateur à la liste des parrains
export const adduserlisttoparrain = async (user, userparrain) => {
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      userParrainList: arrayUnion(userparrain.uid)
    });
  } catch (e) {
    console.log('error : ', e);
  }
};

// Fonction pour créer un document adresse
export const createAdresseDoc = async (user, additionalData) => {
  if (!user) return;
  try {
    const adresse = additionalData[4];
    delete additionalData[4];
    const AddrRef = await addDoc(collection(db, "adresse"), {
      dateCreation: serverTimestamp(),
      ...adresse,
      user: user.uid,
      value: { ...additionalData.filter(item => item !== 4) },
    });

    await updateDoc(doc(db, 'users', user.uid), {
      adresse: arrayUnion(AddrRef.id)
    });
    return AddrRef.id;
  } catch (e) {
    console.log('Erreur :', e);
  }
};

// Définition des valeurs XCP pour les demandes
const demandesValueXCP = {
  'Isolation des combles': [1, 0.5],
  'Isolation du sol': [0.5, 0.5],
  'Chauffe-eau thermodynamique': [1, 0.5],
  'Chauffe-eau solaire individuel': [0.5, 0.5],
  'Pompe à chaleur Air/Eau': [2, 0.5],
  'climatisation réversible (pompe à chaleur Air/Air)': [2, 0.5],
  'Pompe à chaleur géothermique': [2, 0.5],
  'Chaudière Bois (Granulés ou bûches)': [2, 0.5],
  'Poêle à bois (Granulés ou bûches)': [1, 0.5],
  'VMC Double Flux': [1, 0.5],
  'Fenêtres / Portes-fenêtres': [1, 0.5],
};

// Fonction pour créer un document demande
export const createDemandeDoc = async (user, adresseId, additionalData) => {
  if (!user) return;
  const userid = user.uid;
  const vilregadrr = await getDoc(doc(db, 'adresse', adresseId));
  let tokenParrain = {};
  let tokenPartenaire = {};
  let XCPgain = {};

  Object.keys(demandesValueXCP).map((item) => {
    if (additionalData.value[0].value === item) {
      XCPgain = { XCPgain: demandesValueXCP[item][0], XCPgainParte: demandesValueXCP[item][1] }
    }
  });

  if (user.tokenParrain) { tokenParrain = { tokenParrain: user.tokenParrain } };
  if (user.tokenPartenaire) { tokenPartenaire = { tokenPartenaire: user.tokenPartenaire } };

  const ValueNewDoc = {
    user: userid,
    dateCreation: serverTimestamp(),
    ...additionalData,
    ...tokenParrain,
    ...tokenPartenaire,
    ...XCPgain,
    adresse: adresseId,
    region: vilregadrr.data().region,
    ville: vilregadrr.data().ville,
    clientmail: vilregadrr.data().clientmail,
  };

  try {
    const docRef = await addDoc(collection(db, 'demandes'), ValueNewDoc);
    return docRef;
  } catch (e) {
    console.log('Erreur : ', e);
  }
};

// Fonction pour récupérer les utilisateurs en temps réel
export const getUsers = (callback) => {
  const q = query(collection(db, 'users'));
  return onSnapshot(q, callback);
};

// Fonction pour récupérer les demandes en temps réel
export const getDemandes = (callback) => {
  const q = query(collection(db, 'demandes'));
  return onSnapshot(q, callback);
};
