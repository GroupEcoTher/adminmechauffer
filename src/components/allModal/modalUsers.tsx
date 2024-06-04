import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { useEffect, useState } from 'react';
import '../../components/allModal/allmodal.scss';


const ModalUsers = () => {


  const [userData, setUserData] = useState(null);

  // Récupérer les données de l'utilisateur depuis Firebase
  const getUserData = async () => {
    const userRef = firebase.database().ref('users/111');
    const snapshot = await userRef.once('value');
    const userData = snapshot.val();
    setUserData(userData);
  }

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <div className="add">
      <div className="modal">
        {userData && (
          <div>
            <h1>Informations sur l'utilisateur</h1>
            <p>Nom : {userData.lastName}</p>
            <p>Prénom : {userData.firstName}</p>
            <p>Email : {userData.email}</p>
            <p>Téléphone : {userData.phone}</p>
            <p>Date de création : {userData.createdAt}</p>
            <p>Vérifié : {userData.verified ? 'Oui' : 'Non'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalUsers;
