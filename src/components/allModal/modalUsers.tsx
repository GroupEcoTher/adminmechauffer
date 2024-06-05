import { useEffect, useState } from 'react';
import '../../components/allModal/allmodal.scss';
import { db } from "../../config/firebase"; 
import { doc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import moment from 'moment';

interface Props {
  setOpen: (open: boolean) => void;
  slug: string;
}

const ModalUsers = (props: Props) => {
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

  const closeModal = (p0: boolean) => {
    props.setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // Empêche l'actualisation de la page
    // Logique de mise à jour des données
    closeModal(false);  // Ferme le modal après la soumission
  };

  return (
    <div className="add">
      <div className="modal">
        
        <form onSubmit={handleSubmit}>
        
          {userData ? (
            <div>
              <span className="close" onClick={closeModal}>X</span>
              <h1>Informations sur l'utilisateur {props.slug}</h1>
              <p>Id : {userData.id}</p>
              <p>Nom : {userData.lastname}</p>
              <p>Prénom : {userData.firstname}</p>
              <p>Email : {userData.email}</p>
              <p>Téléphone : {userData.phone}</p>
              <p>Date de création : {userData.dateCreation && moment(userData.dateCreation.toDate()).format('DD MMMM YYYY')}</p>
              <p>Dernière mise à jour du mot de passe : {userData.lastpassupdate && moment(userData.lastpassupdate.toDate()).format('DD MMMM YYYY')}</p>
              <p>Lien : {userData.lien}</p>
              <p>Rôle : {userData.role}</p>
              <p>Token Partenaire : {userData.tokenPartenaire}</p>
              <p>Utilisateurs Parrains : {userData.userParrainList}</p>



              <button type="submit">Mettre à Jour</button>
              
            </div>
          ) : (
            <p>Chargement des données utilisateur...</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ModalUsers;
