// Import the functions you need from the SDKs you need

import { sendPasswordResetEmail } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
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


export const getData = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const user = [];
    querySnapshot.forEach((doc) => {
        if(!doc.data().additionalData) user.push({ id: doc.id, ...doc.data() });
    });
    console.log(user);
    return user;
}

export const getDataAdressebyUserID = async (user) => {

    const usersRef = collection(db, 'adresse');
    const q = query(usersRef, where('user', '==', user));
    const querySnapshot = await getDocs(q);
    let res = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      res.push(  {id : doc.id, data : doc.data()}  );
    });
    return res;
}

export const getDataDemandesbyUserID = async (user) => {
  const dateInst = new Date();
  const usersRef = collection(db, 'demandes');
  const q = query(usersRef, where('user', '==', user) , where('dateCreation', '<=', dateInst) , orderBy('dateCreation', "desc"));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    res.push(  {id : doc.id, data : doc.data()}  );
  });
  return res;
}

export const getDataDemandesbyAddresseID = async (add) => {
  const usersRef = collection(db, 'demandes');
  const q = query(usersRef, where('adresse', '==', add));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    res.push(  {id : doc.id, data : doc.data()}  );
  });
  return res;
}

export const getTempXcpByTokenID = async (Token) => {
  const usersRef = collection(db, 'demandes');
  const q = query(usersRef, where('tokenParrain', '==', Token) , where('demandestatus', '==', 'En cours de traitement') , orderBy('XCPgain'));
  const querySnapshot = await getDocs(q);
  const snapshot = await getAggregateFromServer(q, {
    totalTempXcp: sum('XCPgain')
  });
  let res = [snapshot.data().totalTempXcp];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    res.push(  {id : doc.id, data : doc.data()}  );
  });
  return res;
}

export const getUserParrainbyTokenID = async (Token) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('tokenParrain', '==', Token));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    res.push(  {id : doc.id, data : doc.data()}  );
  });
  return res;
}

export const getParrainbyTokenID = async (Token) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('tokenPartenaire', '==', Token));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    res.push(  {id : doc.id, data : doc.data()}  );
  });
  return res;
}

export const createUserDocument = async (user, additionalData) => {
  if (!user) return;
  const { email } = user;
  try {
    const docRef = await setDoc(doc(db, 'users', user.uid), {
      dateCreation : serverTimestamp(),
      ...additionalData,
      email,
    });
    return docRef;
  } catch (e) {
    console.log('error : ', e);
  }
};

export const adduserlisttoparrain = async (user, userparrain) => {
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      userParrainList : arrayUnion(userparrain.uid)
    });
  } catch (e) {
    console.log('error : ', e);
  }
};

export const createAdresseDoc = async (user, additionalData) => {
  if (!user) return; // Vérifie si l'utilisateur est valide
  try {
    // Utilisation de la fonction makeid pour générer une clé aléatoire
    const adresse = additionalData[4];
    delete additionalData[4];
    
    // Création de la référence au document et mise à jour des données avec la nouvelle adresse
    /* const docRef = await updateDoc(doc(db, 'users', user.uid), {
      [`adresse.${adresseId}`]: { dateCreation : serverTimestamp() , ...adresse ,value : {...additionalData.filter(item => item !== 4)} } // Utilisation de la syntaxe de l'objet dynamique pour créer une clé avec une variable
    }); */

    const AddrRef = await addDoc(collection(db, "adresse"), {
      dateCreation : serverTimestamp(),
      ...adresse,
      user : user.uid,
      value : {...additionalData.filter(item => item !== 4)},
    });
    
    await updateDoc(doc(db, 'users', user.uid), {
      adresse : arrayUnion(AddrRef.id)
    });
    return AddrRef.id; // Retourne la référence du document
  } catch (e) {
    console.log('Erreur :', e); // Affichage de l'erreur en cas d'échec
  }
};

const demandesValueXCP = {
  'Isolation des combles' : 1,
  'Isolation du sol' : 0.5,
  'Chauffe-eau thermodynamique' : 1,
  'Chauffe-eau solaire individuel' : 0.5,
  'Pompe à chaleur Air/Eau' : 2,
  'climatisation réversible (pompe à chaleur Air/Air)' : 2,
  'Pompe à chaleur géothermique' : 2,
  'Chaudière Bois (Granulés ou bûches)' : 2,
  'Poêle à bois (Granulés ou bûches)' : 1,
  'VMC Double Flux' : 1,
  'Fenêtres / Portes-fenêtres' : 1,
}

export const createDemandeDoc = async (user, adresseId, additionalData) => {
  if (!user) return;
  const userid = user.uid;
  const vilregadrr = await getDoc(doc(db, 'adresse', adresseId));
  let tokenParrain = {};
  let XCPgain = {};
  
  Object.keys(demandesValueXCP).map((item) => {
    if (additionalData.value[0].value === item) {
      XCPgain = {XCPgain : demandesValueXCP[item]}
    }
  });
  

  if(user.tokenParrain) tokenParrain = { tokenParrain : user.tokenParrain } ;
  
  try {
    const docRef = await addDoc(collection(db, "demandes"), {
        user: userid,
        adresse: adresseId,
        dateCreation : serverTimestamp(),
        demandestatus: 'En cours de traitement',
        region: vilregadrr.data().region,
        ville: vilregadrr.data().ville,
        ...additionalData, // Spread each additionalData item
        ...tokenParrain,
        ...XCPgain,
      });
      await updateDoc(doc(db, 'adresse', adresseId), {
        demandes : arrayUnion(docRef.id)
      });
      await updateDoc(doc(db, 'users', userid), {
        demandes : arrayUnion(docRef.id)
      });
      return docRef;
  } catch (e) {
    console.log('error : ', e);
  }
};


export const DeleteAdresseDoc = async (user, index, type) => {
  if (!user) return;
  console.log(index);
  try {
    const docRef = await updateDoc(doc(db, 'users', user.uid), {
      adresse: {[type] : arrayRemove(index)}
    });
    return docRef;
  } catch (e) {
    console.log('error : ', e);
  }
};



export const updateUserDocument = async (user, additionalData) => {
  if (!user) return;
  const { email } = user;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      'additionalData.devis': { ...additionalData },
    });
  } catch (e) {
    console.log(e);
  }
};

export const removeParrainFirstUser = async (user) => {
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      'additionalData.user': null,
    });
  } catch (e) {
    console.log(e);
  }
};

export const updateUserCoordoneeDocument = async (user, additionalData) => {
  if (!user) return;
  const { email } = user;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      'additionalData.firstname': additionalData.firstname,
      'additionalData.lastname': additionalData.lastname,
      'additionalData.ville': additionalData.ville,
      'additionalData.civilite': additionalData.civilite,
      'additionalData.pays': additionalData.pays,
      'additionalData.codePostal': additionalData.codePostal,
      'additionalData.adresse': additionalData.adresse,
      'additionalData.iban': additionalData.iban,
      'additionalData.nomCompte': additionalData.nomCompte,
    });
  } catch (e) {
    console.log(e);
  }
};

export const updateUserStatusDocument = async (user, status) => {
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user), {
      'additionalData.status': status,
    });
  } catch (e) {
    console.log(e);
  }
};

export const getUserById = async (userId) => {
  if (!userId) return;
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('No such document!');
    }
  } catch (e) {
    throw new Error(e);
  }
};

export const getDevisByUserId = async (userId) => {
  if (!userId) return;
  try {
    const usersRef = collection(db, 'users');

    const q = query(usersRef, where('additionalData.tokenParrain', '==', userId));

    const querySnapshot = await getDocs(q);
    let res = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      res.push({ uid: doc.id, data: doc.data() });
      console.log(doc.id, ' => ', doc.data());
    });
    return res;
  } catch (e) {
    throw new Error(e);
  }
};

export const resetEmail = async (email) => {
  try {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  } catch (e) {}
};
// Recherche les utilisateurs avec des documents manquants
export const getIncompleteUsers = async () => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('piecesIdentites', '==', null), where('avisImpots', '==', null));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
};

// Recherche les utilisateurs NC
export const getNCUsers = async () => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('status', '==', 'NC'));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
};

// Obtient tous les utilisateurs
export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const users = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  return users;
};

export default firebaseConfig;