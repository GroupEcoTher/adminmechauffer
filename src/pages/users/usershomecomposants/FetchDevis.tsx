//src\pages\users\usershomecomposants\FetchDevis.tsx

// appel des devis de la collection users
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../../../config/firebase";

const db = getFirestore(app);

export const fetchDevis = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const allDevis: { id: string; [key: string]: any }[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const devisCollection = collection(userDoc.ref, 'devis');
      const devisSnapshot = await getDocs(devisCollection);
      devisSnapshot.forEach((devisDoc) => {
        allDevis.push({ id: devisDoc.id, ...devisDoc.data() });
      });
    }

    return allDevis;
  } catch (error) {
    console.error("Erreur lors de la récupération des devis :", error);
    throw error;
  }
};