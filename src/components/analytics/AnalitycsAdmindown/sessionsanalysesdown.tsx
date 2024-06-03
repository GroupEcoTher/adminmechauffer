//Il initialise Firebase, définit des fonctions pour démarrer et terminer une session utilisateur, 
//incrémenter le nombre de pages visitées pendant une session, 
//calculer la durée d'une session, et obtenir le total des pages visitées 
//et le temps total passé par un utilisateur sur toutes ses sessions. 
//Assurez-vous que que la collection 'userActivity' existe dans votre base de données Firestore.



import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { getDocs, query, where } from "firebase/firestore";
import { differenceInMilliseconds } from 'date-fns';

const firebaseConfig = {
  // Votre configuration Firebase
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const startUserSession = async (userId) => {
    try {
      const docRef = await addDoc(collection(db, "userActivity"), {
        userId,
        startTime: serverTimestamp(),
        endTime: null,
        pageVisits: 0,
      });
      return docRef.id; // Return the session ID for later use
    } catch (e) {
      console.error('error : ', e);
    }
  };
  
  export const endUserSession = async (sessionId) => {
    try {
      await updateDoc(doc(db, 'userActivity', sessionId), {
        endTime: serverTimestamp()
      });
    } catch (e) {
      console.error('error : ', e);
    }
  };
  
  export const incrementPageVisits = async (sessionId) => {
    try {
      const sessionRef = doc(db, 'userActivity', sessionId);
      await updateDoc(sessionRef, {
        pageVisits: increment(1)
      });
    } catch (e) {
      console.error('error : ', e);
    }
  };

// Calcule la durée de la session en millisecondes
export const getSessionDuration = async (sessionId) => {
  const sessionRef = doc(db, 'userActivity', sessionId);
  const sessionDoc = await getDoc(sessionRef);
  const sessionData = sessionDoc.data();
  if (sessionData.startTime && sessionData.endTime) {
    return differenceInMilliseconds(sessionData.endTime.toDate(), sessionData.startTime.toDate());
  } else {
    console.error('Session start time or end time is missing');
    return null;
  }
};

// Calcule le total des pages visitées par un utilisateur sur toutes ses sessions
export const getTotalPageVisits = async (userId) => {
  const userSessionsRef = collection(db, 'userActivity');
  const q = query(userSessionsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  let totalPageVisits = 0;
  snapshot.forEach((doc) => {
    totalPageVisits += doc.data().pageVisits;
  });
  return totalPageVisits;
};

// Calcule le temps total passé par un utilisateur sur toutes ses sessions
export const getTotalSessionTime = async (userId) => {
  const userSessionsRef = collection(db, 'userActivity');
  const q = query(userSessionsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  let totalSessionTime = 0;
  snapshot.forEach((doc) => {
    const sessionData = doc.data();
    if (sessionData.startTime && sessionData.endTime) {
      totalSessionTime += differenceInMilliseconds(sessionData.endTime.toDate(), sessionData.startTime.toDate());
    }
  });
  return totalSessionTime;
};