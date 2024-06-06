import { useEffect, useState } from 'react';
import '../../components/allModal/allmodal.scss';
import { db } from "../../config/firebase"; 
import { doc, updateDoc, getDoc, collection, getDocs } from "firebase/firestore";
import moment from 'moment';

interface Props {
  setOpen: (open: boolean) => void;
  slug: string;
}

const ModalUsers = (props: Props) => {
  const [userData, setUserData] = useState<any | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [roles, setRoles] = useState<string[]>([]);  // État pour stocker les rôles

  const getUserData = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        setUserData({ id: docSnapshot.id, ...docSnapshot.data() });
        setEditData({ id: docSnapshot.id, ...docSnapshot.data() });  // Initialiser les données éditables
      } else {
        console.error("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const getRoles = async () => {
    try {
      const rolesRef = collection(db, "roles");  // Remplacez par le bon chemin de votre collection des rôles
      const rolesSnapshot = await getDocs(rolesRef);
      const rolesList = rolesSnapshot.docs.map(doc => doc.data().name);  // Assurez-vous que le champ de rôle est 'name'
      setRoles(rolesList);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    const url = window.location.href;
    const userId = url.substring(url.lastIndexOf('/') + 1);
    getUserData(userId);
    getRoles();  // Récupérer les rôles lors du montage du composant
  }, []);

  const closeModal = () => {
    props.setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      setEditData((prevData: any) => ({ ...prevData, [name]: files[0] }));
    } else {
      setEditData((prevData: any) => ({ ...prevData, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    try {
      const userRef = doc(db, "users", editData.id);
      const updatedData = { ...editData };

      // Removing file objects from the data to update
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] instanceof File) {
          delete updatedData[key];
        }
      });

      await updateDoc(userRef, updatedData);

      // Here you would handle file uploads separately
      for (const key of Object.keys(editData)) {
        if (editData[key] instanceof File) {
          // Implement your file upload logic here
          console.log(`Uploading ${key}:`, editData[key]);
        }
      }

      getUserData(editData.id);  // Rafraîchir les données après la mise à jour
      closeModal();
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <div className="add">
      <div className="modal">
        <span className="close" onClick={closeModal}>X</span>
        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
          {userData ? (
            <div>
              <h2>Gestion Users - États & Traitements{props.slug}</h2>
              <h1>Informations sur l'utilisateur {props.slug}</h1>

              <div className="content">
                <div className="column">
                  <div className="item">
                    <p>Id : {userData.id}</p> 
                  </div>
                  <div className="item">
                    <p>Date de création : {userData.dateCreation && moment(userData.dateCreation.toDate()).format('DD MMMM YYYY')}</p>
                  </div>
                  <div className="item">
                    <p>Nom : {userData.lastname}</p>
                    <input type="text" name="lastname" value={editData.lastname || ''} onChange={handleInputChange} />
                  </div>
                  <div className="item">
                    <p>Prénom : {userData.firstname}</p>
                    <input type="text" name="firstname" value={editData.firstname || ''} onChange={handleInputChange} />
                  </div>
                  <div className="item">
                    <p>Email : {userData.email}</p>
                    <input type="email" name="email" value={editData.email || ''} onChange={handleInputChange} />
                  </div>
                  <div className="item">
                    <p>Téléphone : {userData.phone}</p>
                    <input type="text" name="phone" value={editData.phone || ''} onChange={handleInputChange} />
                  </div>
                  <div className="item">
                    <p>Dernière mise à jour du mot de passe : {userData.lastpassupdate && moment(userData.lastpassupdate.toDate()).format('DD MMMM YYYY')}</p>
                  </div>
                </div>

                <div className="column">
                  <div className="item">
                    <p>Utilisateurs Parrains : {userData.userParrainList}</p>
                    {/*<input type="text" name="userParrainList" value={editData.userParrainList || ''} onChange={handleInputChange} />*/}
                  </div>
                  <div className="item">
                    <p>Lien : {userData.lien}</p>
                    <input type="text" name="lien" value={editData.lien || ''} onChange={handleInputChange} />
                  </div>
                  <div className="item">
                    <p>Rôle : {userData.role}</p>
                    <select name="role" value={editData.role || ''} onChange={handleInputChange}>
                      <option value="">Sélectionnez un rôle</option>
                      {roles.map((role, index) => (
                        <option key={index} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="item">
                    <p>Token Partenaire : {userData.tokenPartenaire}</p>
                    <input type="text" name="tokenPartenaire" value={editData.tokenPartenaire || ''} onChange={handleInputChange} />
                  </div>
                  <div className="item">
                    <label>Pièce Identité :</label>
                    <input type="file" name="pieceIdentite" onChange={handleInputChange} />
                  </div>
                  <div className="item">
                    <label>Avis D'impôts :</label>
                    <input type="file" name="avisImpots" onChange={handleInputChange} />
                  </div>
                </div>
              </div>

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
