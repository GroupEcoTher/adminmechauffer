import { initializeApp } from 'firebase/app';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, getDocs, doc, getDoc, collection, query, where, orderBy, setDoc, serverTimestamp, updateDoc, addDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

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

// Exportation des constantes globales
export const db = getFirestore(app);
export const auth = getAuth(app);
export const authSecond = getAuth(appSecond);
export const storage = getStorage(app);
export { app, appSecond };




// Fonction pour vérifier l'existence d'un document dans Firebase Storage
const documentExists = async (userId: string, fileName: string): Promise<boolean> => {
  const fileRef = ref(storage, `${userId}/${fileName}`);
  try {
    await getDownloadURL(fileRef);
    return true;
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      return false;
    } else {
      console.error('Erreur lors de la vérification du document:', error);
      return false;
    }
  }
};





// Fonction pour vérifier et mettre à jour le statut de vérification de l'utilisateur
export const checkAndUpdateVerificationStatus = async (userId: string): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  const userSnapshot = await getDoc(userDocRef);

  if (userSnapshot.exists()) {
    // Vérification de la présence des documents dans Firebase Storage
    const identityDocumentExists = await documentExists(userId, 'ci0.png');
    const taxNoticeDocumentExists = await documentExists(userId, 'impot0.png');

    // Mise à jour du statut de vérification
    let verificationStatus = 'Non Vérifiée';
    if (identityDocumentExists && taxNoticeDocumentExists) {
      verificationStatus = 'Vérifiée';
    }

    try {
      await updateDoc(userDocRef, { 'status': verificationStatus });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de vérification:', error);
    }
  } else {
    console.error(`Utilisateur avec ID ${userId} non trouvé.`);
  }
};






// Fonction pour obtenir les utilisateurs incomplets
export const getIncompleteUsers = async (): Promise<any[]> => {
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

  const incompleteUsers: any[] = [];

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



export const formatFirebaseTimestamp = (firebaseTimestamp: { seconds: number, nanoseconds: number }): Date | null => {
  if (firebaseTimestamp && typeof firebaseTimestamp.seconds === 'number' && typeof firebaseTimestamp.nanoseconds === 'number') {
    return new Date(firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1000000);
  }
  return null;
};



// Fonction pour obtenir les données des utilisateurs
export const getData = async (): Promise<any[]> => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const users: { id: string; [key: string]: any }[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  console.log(users);
  return users;
}

// Fonction pour obtenir tous les utilisateurs, y compris les archivés
export const getAllUsers = async (): Promise<any[]> => {
  // Créez une requête pour récupérer les utilisateurs où le champ "archived" est soit absent, soit égal à false
  const activeUsersQuery = query(collection(db, "users"), where("archived", "==", false));
  const archivedUsersQuery = query(collection(db, "users"), where("archived", "==", true));


  
  // Exécutez les requêtes
  const [activeUsersSnapshot, archivedUsersSnapshot] = await Promise.all([
    getDocs(activeUsersQuery),
    getDocs(archivedUsersQuery)
  ]);

  // Fusionnez les résultats des deux requêtes
  const users: { id: string; [key: string]: any }[] = [];
  
  activeUsersSnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });

  archivedUsersSnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });

  console.log("Nombre total d'utilisateurs: ", users.length);
  return users;
};



// Fonction pour obtenir le nombre total d'utilisateurs
export const getTotalUsers = async (): Promise<number> => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.size;
};




// Fonction pour obtenir les utilisateurs NC
export const getNCUsers = async (): Promise<any[]> => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  const users: any[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.documents?.identity?.status === 'Non Conforme' || data.documents?.taxNotice?.status === 'Non Conforme') {
      users.push({ id: doc.id, ...data });
    }
  });
  return users;
};



// Fonction pour récupérer les utilisateurs archivés
export const fetchArchivedUsers = async (): Promise<any[]> => {
  const q = query(collection(db, 'users'), where('archived', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};




// Fonction pour désarchiver un utilisateur
export const unarchiveUser = async (userId: string): Promise<void> => {
  // Met à jour le champ 'archived' du document utilisateur spécifié à false
  await updateDoc(doc(db, 'users', userId), { archived: false });
};




// Fonction pour récupérer la liste des éléments archivés
export const fetchArchived = async (): Promise<any[]> => {
  const archivedRef = collection(db, 'archived'); // Remplacez 'archived' par le nom de votre collection d'éléments archivés
  const q = query(archivedRef);

  // Exécuter la requête et obtenir les documents
  const querySnapshot = await getDocs(q);

  const archivedItems: { id: string; [key: string]: any }[] = [];

  querySnapshot.forEach((doc) => {
    archivedItems.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  console.log('Archived Items:', archivedItems);
  return archivedItems;
};





// Fonction pour obtenir un document par ID
export const getDocumentById = async (id: string): Promise<any | null> => {
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
export const getDataAdressebyUserID = async (userID: string): Promise<any | null> => {
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
export const getDataDemandesbyUserID = async (user: string): Promise<any[]> => {
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
export const getTempXcpByTokenID = async (Token: string): Promise<any[]> => {
  const usersRef = collection(db, 'demandes');
  const q = query(usersRef, where('tokenParrain', '==', Token), where('demandestatus', '==', 'En cours de traitement'), orderBy('XCPgain'));
  const querySnapshot = await getDocs(q);
  const res: any[] = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
}




// Fonction pour obtenir le temp XCP par token partenaire
export const getTempXcpByTokenPartenaire = async (user: any): Promise<any[]> => {
  const usersRef = collection(db, 'demandes');
  const q = query(usersRef, where('tokenParrain', '==', user.uid), where('demandestatus', '==', 'En cours de traitement'), orderBy('XCPgain'));
  const querySnapshot = await getDocs(q);
  const res: any[] = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
}




// Fonction pour obtenir les utilisateurs parrain par token ID
export const getUserParrainbyTokenID = async (Token: string): Promise<any[]> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('tokenParrain', '==', Token));
  const querySnapshot = await getDocs(q);
  const res: any[] = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
}





// Fonction pour obtenir les parrains par token ID
export const getParrainbyTokenID = async (Token: string): Promise<any[]> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('tokenPartenaire', '==', Token));
  const querySnapshot = await getDocs(q);
  const res: any[] = [];
  querySnapshot.forEach((doc) => {
    res.push({ id: doc.id, data: doc.data() });
  });
  return res;
}




// Fonction pour créer un document utilisateur
export const createUserDocument = async (user: any, additionalData: any): Promise<void> => {
  if (!user) return;
  const { email } = user;
  try {
    const docRef = await setDoc(doc(db, 'users', user.uid), {
      dateCreation: serverTimestamp(),
      ...additionalData,
      email,
    });
    return docRef;
  } catch (e: any) {
    console.log('error : ', e);
  }
};





// Fonction pour ajouter un utilisateur à la liste de parrainage
export const adduserlisttoparrain = async (user: any, userparrain: any): Promise<void> => {
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      userParrainList: arrayUnion(userparrain.uid)
    });
  } catch (e: any) {
    console.log('error : ', e);
  }
};





// Fonction pour créer un document d'adresse
export const createAdresseDoc = async (user: any, additionalData: any): Promise<string | void> => {
  if (!user) return;
  try {
    const adresse = additionalData[4];
    delete additionalData[4];
    const AddrRef = await addDoc(collection(db, "adresse"), {
      dateCreation: serverTimestamp(),
      ...adresse,
      user: user.uid,
      value: { ...additionalData.filter((item: any) => item !== 4) },
    });
    await updateDoc(doc(db, 'users', user.uid), {
      adresse: arrayUnion(AddrRef.id)
    });
    return AddrRef.id;
  } catch (e: any) {
    console.log('Erreur :', e);
  }
};





// Fonction pour supprimer un document d'adresse
export const DeleteAdresseDoc = async (user: any, index: string, type: string): Promise<void> => {
  if (!user) return;
  console.log(index);
  try {
    const docRef = await updateDoc(doc(db, 'users', user.uid), {
      adresse: { [type]: arrayRemove(index) }
    });
    return docRef;
  } catch (e: any) {
    console.log('error : ', e);
  }
};





// Fonction pour mettre à jour l'email
export const EmailUpdate = async (user: any, value: any): Promise<{ msg: string, type: string }> => {
  const credential = EmailAuthProvider.credential(
    user.email,
    value.oldpass
  );
  const result = reauthenticateWithCredential(auth.currentUser!, credential)
    .then(() => {
      return updateEmail(auth.currentUser!, value.email).then(async () => {
        await updateDoc(doc(db, 'users', user.uid), {
          'email': value.email,
        });
        return { msg: "Votre email est bien changé", type: "msg" };
      }).catch(() => {
        return { msg: "Cet email est déjà utilisé", type: "error" };
      });
    })
    .catch(() => {
      return { msg: "Mot de passe non valide", type: "error" };
    });
  return result;
};




// Fonction pour mettre à jour le mot de passe
export const PassUpdate = async (user: any, value: any): Promise<{ msg: string, type: string }> => {
  const credential = EmailAuthProvider.credential(
    user.email,
    value.oldpass
  );
  const result = reauthenticateWithCredential(auth.currentUser!, credential)
    .then(() => {
      return updatePassword(auth.currentUser!, value.newpass).then(async () => {
        await updateDoc(doc(db, 'users', user.uid), {
          'lastpassupdate': serverTimestamp()
        });
        return { msg: "Votre mot de passe est bien changer", type: "msg" };
      }).catch(() => {
        return { msg: "Veuillez réessayer plus tard", type: "error" };
      });
    })
    .catch(() => {
      return { msg: "L'ancien Mot de passe non valide", type: "error" };
    });
  return result;
};





// Fonction pour mettre à jour le numéro de téléphone
export const PhoneUpdate = async (user: any, value: any): Promise<{ msg: string, type: string }> => {
  const credential = EmailAuthProvider.credential(
    user.email,
    value.oldpass
  );
  const result = reauthenticateWithCredential(auth.currentUser!, credential)
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
export const updateUserDocument = async (user: any, additionalData: any): Promise<void> => {
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      'additionalData.devis': { ...additionalData },
    });
  } catch (e: any) {
    console.log(e);
  }
};




// Fonction pour supprimer le premier utilisateur parrain
export const removeParrainFirstUser = async (user: any): Promise<void> => {
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      'additionalData.user': null,
    });
  } catch (e: any) {
    console.log(e);
  }
};




// Fonction pour mettre à jour le document des coordonnées de l'utilisateur
export const updateUserCoordoneeDocument = async (user: any, additionalData: any): Promise<void> => {
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
  } catch (e: any) {
    console.log(e);
  }
};



// Fonction pour mettre à jour le statut de l'utilisateur
export const updateUserStatusDocument = async (user: any, status: string): Promise<void> => {
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user), {
      'status': status,
    });
  } catch (e: any) {
    console.log(e);
  }
};




// Fonction pour obtenir un utilisateur par ID
export const getUserById = async (userId: string): Promise<any | null> => {
  if (!userId) return null;
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('No such document!');
    }
  } catch (e: any) {
    throw new Error(e.message);
  }
};




// Fonction pour obtenir les devis par ID utilisateur
export const getDevisByUserId = async (userId: string): Promise<any[]> => {
  if (!userId) return [];
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('tokenParrain', '==', userId));
    const querySnapshot = await getDocs(q);
    let res: any[] = [];
    querySnapshot.forEach((doc) => {
      res.push({ uid: doc.id, data: doc.data() });
    });
    return res;
  } catch (e: any) {
    throw new Error(e.message);
  }
};




export const createDemandeDoc = async (user: any, adresseId: string, additionalData: any): Promise<void> => {
  if (!user) return;
  const userid = user.uid;
  const vilregadrr = await getDoc(doc(db, 'adresse', adresseId));
  let tokenParrain: { [key: string]: any } = {};
  let tokenPartenaire: { [key: string]: any } = {};
  let XCPgain: { [key: string]: any } = {};

  // Vous devez définir la variable demandesValueXCP avant d'utiliser cette fonction
  const demandesValueXCP: { [key: string]: [number, number] } = {
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
      region: vilregadrr.data()?.region,
      ville: vilregadrr.data()?.ville,
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
  } catch (e: any) {
    console.log('error : ', e);
  }
};







// Fonction pour réinitialiser l'email
export const resetEmail = async (email: string): Promise<void> => {
  try {
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Erreur lors de la réinitialisation de l\'email:', error);
  }
};





// Fonction pour afficher une image
export const AfficheImg = async (user: string, path: string): Promise<boolean> => {
  const storage = getStorage();
  try {
    const url = await getDownloadURL(ref(storage, `${user}/${path}`));
    window.open(url, '_blank', 'height=600,width=800');
    return true; // Document exists
  } catch (error) {
    console.error('Pas de documents trouvés:', error);
    return false; // Document does not exist
  }
};




// Fonction pour télécharger un document depuis Firebase Storage
export const downloadDocument = async (userId: string, fileName: string): Promise<File | null> => {
  const storage = getStorage();
  try {
    const url = await getDownloadURL(ref(storage, `${userId}/${fileName}`));
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  } catch (error) {
    console.error('Pas de documents trouvés:', error);
    alert('Pas de documents trouvés');
    return null;
  }
};

export default firebaseConfig;
