/////////////////Si je ne veut pas passer par le fichier firebase : importer des fonctions nécessaires de firebase/firestore et firebase/auth.
// import {
//     getFirestore,
//     collection,
//     getDocs,
//     query,
//     where,
//     orderBy
//   } from 'firebase/firestore';
//   import { getAuth } from 'firebase/auth';
//   import { initializeApp } from 'firebase/app';


////////////////Puis  importer la configuration de Firebase et initialiser l'application Firebase
//   const firebaseConfig = {
//     apiKey: 'AIzaSyAJuCAWruOL5yBF3L7JXcTNTBReSA7lRAY',
//     authDomain: 'mechauffernext.firebaseapp.com',
//     projectId: 'mechauffernext',
//     storageBucket: 'mechauffernext.appspot.com',
//     messagingSenderId: '336346984646',
//     appId: '1:336346984646:web:00b5f78bbf7aa4225c27c7',
//   };
//   const app = initializeApp(firebaseConfig);
//   export const db = getFirestore(app);
//   export const auth = getAuth(app);


import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from 'path/to/your/firebase/config';


// Nombre total d'utilisateurs
export const getTotalUsers = async () => {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.size;
  };

// Nombre d'utilisateurs avec un certain statut
  export const getUsersByStatus = async (status) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('status', '==', status));
    const snapshot = await getDocs(q);
    return snapshot.size;
  };

//Nombre d'utilisateurs créés après une certaine date
  export const getUsersCreatedAfterDate = async (date) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('dateCreation', '>', date));
    const snapshot = await getDocs(q);
    return snapshot.size;
  };

  // Nombre d'utilisateurs ayant un certain rôle
  export const getUsersByRole = async (role) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', role));
    const snapshot = await getDocs(q);
    return snapshot.size;
  };

  // Nombre d'utilisateurs ayant un certain nombre d'adresses
  export const getUsersByAddressCount = async (count) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('addresses.length', '==', count));
    const snapshot = await getDocs(q);
    return snapshot.size;
  };


// Ces exemples supposent que vous avez des champs status, dateCreation, role et addresses dans vos documents users. 
//Si ce n'est pas le cas, vous devrez adapter les fonctions en conséquence.


// Nombre d'utilisateurs avec un certain TempXcp
export const getUsersByTempXcp = async (tempXcp) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('TempXcp', '==', tempXcp));
    const snapshot = await getDocs(q);
    return snapshot.size;
  };
  
  // Nombre d'utilisateurs avec un certain TokenID
  export const getUsersByTokenID = async (tokenID) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('TokenID', '==', tokenID));
    const snapshot = await getDocs(q);
    return snapshot.size;
  };

//const usersWithCertainTempXcp = await getUsersByTempXcp('someTempXcp');
//const usersWithCertainTokenID = await getUsersByTokenID('someTokenID');



// Pour obtenir TempXcp par TokenID, vous pouvez créer une nouvelle fonction dans le fichier src/config/firebase.js. 
//Cette fonction utilisera une requête pour obtenir les documents de la collection 'demandes' où 'tokenParrain' est égal au TokenID fourni. 
//Ensuite, elle somme les valeurs de 'XCPgain' pour ces documents.
export const getTempXcpByTokenID = async (TokenID) => {
    const usersRef = collection(db, 'demandes');
    const q = query(usersRef, where('tokenParrain', '==', TokenID));
    const querySnapshot = await getDocs(q);
    let totalTempXcp = 0;
    querySnapshot.forEach((doc) => {
      totalTempXcp += doc.data().XCPgain;
    });
    return totalTempXcp;
  }

  //Cette fonction getTempXcpByTokenID prend en entrée un TokenID, 
  //effectue une requête pour obtenir tous les documents de la collection 'demandes' où 'tokenParrain' est égal à ce TokenID, 
  //puis somme les valeurs de 'XCPgain' pour ces documents. La somme est ensuite renvoyée.


//Vous pouvez utiliser cette fonction dans votre code comme ceci :
const totalTempXcp = await getTempXcpByTokenID('votre-token-id-ici');
console.log(totalTempXcp);

//Remplacez 'votre-token-id-ici' par le TokenID pour lequel vous souhaitez obtenir le TempXcp.
//vous devez fournir un TokenID spécifique comme argument à la fonction getTempXcpByTokenID. 
//Cette fonction va alors chercher dans la base de données tous les documents où le tokenParrain est égal à ce TokenID spécifique, 
//et sommer les valeurs de XCPgain pour ces documents.


// Nombre total de TempXcp pour tous les utilisateurs
export const getTotalTempXcp = async () => {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    let totalTempXcp = 0;
    snapshot.forEach((doc) => {
      totalTempXcp += doc.data().TempXcp;
    });
    return totalTempXcp;
}
  }
  
// Nombre total de TokenID pour tous les utilisateurs
export const getTotalTokenID = async () => {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    let totalTokenID = 0;
    snapshot.forEach((doc) => {
      if (doc.data().TokenID) {
        totalTokenID++;
      }
    });
    return totalTokenID;
  }

// Récupère tous les utilisateurs de la collection "users" qui n'ont pas de données supplémentaires.
export const getData = async () => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('additionalData', '==', null));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  };
  
  // Récupère les adresses associées à un utilisateur spécifique.
  export const getDataAdressebyUserID = async (userID) => {
    const addressesRef = collection(db, 'addresses');
    const q = query(addressesRef, where('userID', '==', userID));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  };
  
  // Récupère les demandes associées à un utilisateur spécifique, triées par date de création.
  export const getDataDemandesbyUserID = async (userID) => {
    const requestsRef = collection(db, 'requests');
    const q = query(requestsRef, where('userID', '==', userID), orderBy('creationDate'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  };
  
  // Récupère les demandes associées à une adresse spécifique.
  export const getDataDemandesbyAddresseID = async (addressID) => {
    const requestsRef = collection(db, 'requests');
    const q = query(requestsRef, where('addressID', '==', addressID));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  };
  
  // Récupèrent des informations spécifiques basées sur un Token donné.
  export const getUserParrainbyTokenID = async (tokenID) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('TokenID', '==', tokenID));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  };
  
  export const getParrainbyTokenID = async (tokenID) => {
    const parrainsRef = collection(db, 'parrains');
    const q = query(parrainsRef, where('TokenID', '==', tokenID));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  };