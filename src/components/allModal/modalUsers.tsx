// src/components/allModal/ModalUsers.tsx
import { useEffect, useState } from 'react';
import '../../components/allModal/allmodal.scss';
import { db } from "../../config/firebase"; 
import { doc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import moment from 'moment';

const ModalUsers = () => {
  const [userData, setUserData] = useState<any | null>(null);

  
  const getUserData = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        setUserData({ id: docSnapshot.id, ...docSnapshot.data() });
      } else {
        console.error("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const url = window.location.href;
    const userId = url.substring(url.lastIndexOf('/') + 1);
    getUserData(userId);
  }, []);

  return (
    <div className="add">
      <div className="modal">
        {userData ? (
          <div>
            <h1>Informations sur l'utilisateur</h1>
            <p>Id : {userData.id}</p>
            <p>Nom : {userData.lastname}</p>
            <p>Prénom : {userData.firstname}</p>
            <p>Email : {userData.email}</p>
            <p>Téléphone : {userData.phone}</p>
            <p>Date de création : {userData.dateCreation}</p>
            <p>Dernière mise à jour du mot de passe : {userData.lastpassupdate}</p>
            <p>Lien : {userData.lien}</p>
            <p>Rôle : {userData.role}</p>
            <p>Token Partenaire : {userData.tokenPartenaire}</p>
            <p>Utilisateurs Parrains : {userData.userParrainList}</p>
          </div>
        ) : (
          <p>Chargement des données utilisateur...</p>
        )}
      </div>
    </div>
  );
};
export default ModalUsers;
