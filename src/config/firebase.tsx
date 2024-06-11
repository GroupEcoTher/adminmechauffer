import { initializeApp } from 'firebase/app';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, getDocs, doc, getDoc, collection, query, where, orderBy, setDoc, serverTimestamp, updateDoc, addDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage ,ref, getDownloadURL} from 'firebase/storage';

// CONFIGURATION DE L'APPLICATION FIREBASE
const firebaseConfig = {
  apiKey: 'AIzaSyAJuCAWruOL5yBF3L7JXcTNTBReSA7lRAY',
  authDomain: 'mechauffernext.firebaseapp.com',
  projectId: 'mechauffernext',
  storageBucket: 'mechauffernext.appspot.com',
  messagingSenderId: '336346984646',
  appId: '1:336346984646:web:00b5f78bbf7aa4225c27c7',
};

// INITIALISATION DE L'APPLICATION FIREBASE
const app = initializeApp(firebaseConfig);
const appSecond = initializeApp(firebaseConfig, 'Secondary');

// exportation des constantes globales
export const db = getFirestore(app);
export const auth = getAuth(app);
export const authSecond = getAuth(appSecond);
export const storage = getStorage(app);
export { app, appSecond };

// Fonction pour obtenir les utilisateurs incomplets
export const getIncompleteUsers = async () => {
  const usersRef = collection(db, 'users');

  // Créer une requête pour obtenir les utilisateurs qui n'ont pas rempli les conditions
  const q = query(
    usersRef,
    where('civilite', '==', ''),
    where('email', '==', ''),
    where('lastname', '==', ''),
    where('firstname', '==', ''),
    where('phone', '==', ''),
    where('adresse', '==', '')
  );

  // Exécuter la requête et obtenir les documents
  const querySnapshot = await getDocs(q);

  const incompleteUsers: { id: string; [key: string]: any }[] = [];

  querySnapshot.forEach((doc) => {
    const userData = doc.data();

    // Vérifier si les documents sont présents et validés
    const isIdentityValid = userData.documents?.identity?.status === 'Validé';
    const isTaxNoticeValid = userData.documents?.taxNotice?.status === 'Validé';

    if (!isIdentityValid || !isTaxNoticeValid) {
      incompleteUsers.push({
        id: doc.id,
        ...userData,
      });
    }
  });

  return incompleteUsers;
};

// Fonction pour obtenir les données des utilisateurs
export const getData = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const users: { id: string; [key: string]: any }[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  console.log(users);
  return users;
}

// Fonction pour obtenir tous les utilisateurs
export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  console.log("Nombre total d'utilisateurs: ", querySnapshot.size);
  const users: { id: string; [key: string]: any }[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  return users;
};

// Fonction pour obtenir le nombre total d'utilisateurs
export const getTotalUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.size;
};

// Fonction pour obtenir les utilisateurs NC
export const getNCUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  const users = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.documents?.identity?.status === 'Non Conforme' || data.documents?.taxNotice?.status === 'Non Conforme') {
      users.push({ id: doc.id, ...data });
    }
  });
  return users;
};

// Fonction pour obtenir un document par ID
export const getDocumentById = async (id: string) => {
  const docRef = doc(db, "users", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    console.log("No such document!");
    return null;
  }
};

// Fonction pour obtenir les données d'adresse par user ID
export const getDataAdressebyUserID = async (userID: string) => {
  const docRef = doc(db, "users", userID);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data && data.adresse) {
      return data.adresse;
    } else {
      console.log("No address found for this user!");
      return null;
    }
  } else {
    console.log("No such document!");
    return null;
  }
};

// Fonction pour obtenir les demandes par user ID
export const getDataDemandesbyUserID = async (user: string) => {
  const dateInst = new Date();
  const usersRef = collection(db, 'demandes');
  const q = query(usersRef, where('user', '==', user), where('dateCreation', '<=', dateInst), orderBy('dateCreation', "desc"));
  const querySnapshot = await getDocs(q);
  const res: { id: string; data: any }[] = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
}

// Fonction pour obtenir le temp XCP par token ID
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
}

// Fonction pour obtenir le temp XCP par token partenaire
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
}

// Fonction pour obtenir les utilisateurs parrain par token ID
export const getUserParrainbyTokenID = async (Token) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('tokenParrain', '==', Token));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
}

// Fonction pour obtenir les parrains par token ID
export const getParrainbyTokenID = async (Token) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('tokenPartenaire', '==', Token));
  const querySnapshot = await getDocs(q);
  let res = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
}

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

// Fonction pour ajouter un utilisateur à la liste de parrainage
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

// Fonction pour créer un document d'adresse
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

// Fonction pour supprimer un document d'adresse
export const DeleteAdresseDoc = async (user, index, type) => {
  if (!user) return;
  console.log(index);
  try {
    const docRef = await updateDoc(doc(db, 'users', user.uid), {
      adresse: { [type]: arrayRemove(index) }
    });
    return docRef;
  } catch (e) {
    console.log('error : ', e);
  }
};

// Fonction pour mettre à jour l'email
export const EmailUpdate = async (user, value) => {
  const credential = EmailAuthProvider.credential(
    user.email,
    value.oldpass
  );
  const result = reauthenticateWithCredential(auth.currentUser, credential)
    .then(() => {
      return updateEmail(auth.currentUser, value.email).then(async () => {
        await updateDoc(doc(db, 'users', user.uid), {
          'email': value.email,
        });
        return { msg: "Votre email est bien changer", type: "msg" };
      }).catch(() => {
        return { msg: "Ce email est déjà faites", type: "error" };
      });
    })
    .catch((error) => {
      return { msg: "Mot de passe non valide", type: "error" };
    });
  return result;
};

// Fonction pour mettre à jour le mot de passe
export const PassUpdate = async (user, value) => {
  const credential = EmailAuthProvider.credential(
    user.email,
    value.oldpass
  );
  const result = reauthenticateWithCredential(auth.currentUser, credential)
    .then(() => {
      return updatePassword(auth.currentUser, value.newpass).then(async () => {
        await updateDoc(doc(db, 'users', user.uid), {
          'lastpassupdate': serverTimestamp()
        });
        return { msg: "Votre mot de passe est bien changer", type: "msg" };
      }).catch(() => {
        return { msg: "Veuillez réessayer plus tard", type: "error" };
      });
    })
    .catch((error) => {
      return { msg: "L'ancien Mot de passe non valide", type: "error" };
    });
  return result;
};

// Fonction pour mettre à jour le numéro de téléphone
export const PhoneUpdate = async (user, value) => {
  const credential = EmailAuthProvider.credential(
    user.email,
    value.oldpass
  );
  const result = reauthenticateWithCredential(auth.currentUser, credential)
    .then(async () => {
      return await updateDoc(doc(db, 'users', user.uid), {
        'phone': value.phone,
      }).then(() => {
        return { msg: "Votre numero est bien changer", type: "msg" };
      }).catch(() => {
        return { msg: "Veuillez réessayer plus tard", type: "error" };
      })
    }).catch(() => {
      return { msg: "L'ancien Mot de passe non valide", type: "error" };
    });
  return result;
};

// Fonction pour mettre à jour le document utilisateur
export const updateUserDocument = async (user, additionalData) => {
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      'additionalData.devis': { ...additionalData },
    });
  } catch (e) {
    console.log(e);
  }
};

// Fonction pour supprimer le premier utilisateur parrain
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

// Fonction pour mettre à jour le document des coordonnées de l'utilisateur
export const updateUserCoordoneeDocument = async (user, additionalData) => {
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      'firstname': additionalData.firstname,
      'lastname': additionalData.lastname,
      'ville': additionalData.ville,
      'civilite': additionalData.civilite,
      'pays': additionalData.pays,
      'codePostal': additionalData.codePostal,
      'adresse': additionalData.adresse,
      'iban': additionalData.iban,
      'nomCompte': additionalData.nomCompte,
    });
  } catch (e) {
    console.log(e);
  }
};

// Fonction pour mettre à jour le statut de l'utilisateur
export const updateUserStatusDocument = async (user, status) => {
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user), {
      'status': status,
    });
  } catch (e) {
    console.log(e);
  }
};

// Fonction pour obtenir un utilisateur par ID
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

// Fonction pour obtenir les devis par ID utilisateur
export const getDevisByUserId = async (userId) => {
  if (!userId) return;
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('tokenParrain', '==', userId));
    const querySnapshot = await getDocs(q);
    let res = [];
    querySnapshot.forEach((doc) => {
      res.push({ uid: doc.id, data: doc.data() });
    });
    return res;
  } catch (e) {
    throw new Error(e);
  }
};

// Fonction pour créer un document de demande
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

  try {
    const docRef = await addDoc(collection(db, "demandes"), {
      user: userid,
      adresse: adresseId,
      dateCreation: serverTimestamp(),
      demandestatus: 'En cours de traitement',
      region: vilregadrr.data().region,
      ville: vilregadrr.data().ville,
      ...additionalData,
      ...tokenParrain,
      ...tokenPartenaire,
      ...XCPgain,
    });
    await updateDoc(doc(db, 'adresse', adresseId), {
      demandes: arrayUnion(docRef.id)
    });
    await updateDoc(doc(db, 'users', userid), {
      demandes: arrayUnion(docRef.id)
    });
    return docRef;
  } catch (e) {
    console.log('error : ', e);
  }
};

// Fonction pour réinitialiser l'email
export const resetEmail = async (email) => {
  try {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  } catch (e) { }
};

export const AfficheImg = async (user , path) => {
  const storage = getStorage();
  getDownloadURL(ref(storage, user+'/'+path))
  .then((url) => {

    window.open(url, '_blank', 'height=600,width=800');
  })
  .catch(() => {
    alert('Il y a aucune document')
  });
}


// valeur des demandes XCP
/*const demandesValueXCP = {
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
};*/

// valeur des demandes XCP
/*export const demandesValueXCP = {
  'Pompe à chaleur Air/Eau': [2, 0.5],
  'Chaudière Bois (Granulés ou bûches)': [2, 0.5],
  'Poêle à bois (Granulés ou bûches)': [1, 0.5],
  'VMC Double Flux': [1, 0.5],
  'Chauffe-eau thermodynamique': [1, 0.5],
  'Isolation des combles': [1, 0.5],
  'Fenêtres / Portes-fenêtres': [1, 0.5],
  'Chauffe-eau solaire individuel': [0.5, 0.5],
  'Isolation du sol': [0.5, 0.5]
};*/


// CONSTANTES GÉNÉRALES

export default firebaseConfig;
