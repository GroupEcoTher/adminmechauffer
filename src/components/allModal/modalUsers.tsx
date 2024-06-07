import { useEffect, useState } from 'react';
import '../../components/allModal/allmodal.scss';
import { db, getDataAdressebyUserID } from "../../config/firebase";
import { doc, updateDoc, getDoc, collection, getDocs, addDoc, setDoc, deleteDoc } from "firebase/firestore";
import moment from 'moment';
import { Checkbox, Button } from "@mui/material";

interface Props {
  setOpen: (open: boolean) => void;
  slug: string;
}

const ModalUsers = (props: Props) => {
  const [userData, setUserData] = useState<any | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [userAddresses, setUserAddresses] = useState<any[]>([]); // Nouvel état pour les adresses

  const getUserData = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        setUserData({ id: docSnapshot.id, ...docSnapshot.data() });
        setEditData({ id: docSnapshot.id, ...docSnapshot.data() });
      } else {
        console.error("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fonction pour récupérer les adresses de l'utilisateur
  const getUserAddresses = async (userId: string) => {
    try {
      const addresses = await getDataAdressebyUserID(userId);
      setUserAddresses(addresses);
    } catch (error) {
      console.error("Error fetching user addresses:", error);
    }
  };

  const saveHistory = async (userId: number, action: string, details: string) => {
    try {
      const historyRef = collection(db, "history");
      await addDoc(historyRef, {
        userId,
        action,
        details,
        timestamp: new Date(),
      });
      console.log(`History saved for user ${userId}: ${action}`);
    } catch (error) {
      console.error("Error saving history: ", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const userDocRef = doc(db, "users", id.toString());
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const archiveUserDocRef = doc(db, "archiveUsers", id.toString());
        await setDoc(archiveUserDocRef, { ...userData, archived: true });
        await deleteDoc(userDocRef);

        console.log(`Deleted item with id: ${id} and archived it successfully.`);
        setUserData((prevData) => prevData && prevData.id === id ? { ...prevData, archived: true } : prevData);
        await saveHistory(id, "archive", `User with id ${id} archived`);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleUnarchive = async (id: number) => {
    try {
      const archiveUserDocRef = doc(db, "archiveUsers", id.toString());
      const archiveUserDocSnap = await getDoc(archiveUserDocRef);

      if (archiveUserDocSnap.exists()) {
        const userData = archiveUserDocSnap.data();
        const userDocRef = doc(db, "users", id.toString());
        await setDoc(userDocRef, { ...userData, archived: false });
        await deleteDoc(archiveUserDocRef);

        console.log(`Unarchived item with id: ${id} successfully.`);
        setUserData((prevData) => prevData && prevData.id === id ? { ...prevData, archived: false } : prevData);
        await saveHistory(id, "unarchive", `User with id ${id} unarchived`);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error unarchiving document: ", error);
    }
  };

  const handleStandBY = async (id: number, standby: boolean) => {
    try {
      const userDocRef = doc(db, "users", id.toString());
      await updateDoc(userDocRef, {
        standby: standby
      });

      console.log(`User with id: ${id} is now ${standby ? 'in StandBY mode' : 'active'}.`);
      setUserData((prevData) => prevData && prevData.id === id ? { ...prevData, standby } : prevData);
      await saveHistory(id, "standby", `User with id ${id} set to ${standby ? 'StandBY' : 'active'}`);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const getUserHistory = async (userId: string) => {
    try {
      const historyRef = collection(db, "history");
      const historySnapshot = await getDocs(historyRef);
      const userHistoryData = historySnapshot.docs
        .filter(doc => doc.data().userId === userId)
        .map(doc => doc.data().description);
      setUserHistory(userHistoryData);
    } catch (error) {
      console.error("Error fetching user history:", error);
    }
  };

  const getRoles = async () => {
    try {
      const rolesRef = collection(db, "roles");
      const rolesSnapshot = await getDocs(rolesRef);
      const rolesList = rolesSnapshot.docs.map(doc => doc.data().name);
      setRoles(rolesList);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    const url = window.location.href;
    const userId = url.substring(url.lastIndexOf('/') + 1);
    getUserData(userId);
    getRoles();
    getUserHistory(userId);
    getUserAddresses(userId); // Récupérer les adresses de l'utilisateur
  }, []);

  const closeModal = () => {
    props.setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      setEditData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setEditData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    try {
      const userRef = doc(db, "users", editData.id);
      const updatedData = { ...editData };

      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] instanceof File) {
          delete updatedData[key];
        }
      });

      await updateDoc(userRef, updatedData);

      for (const key of Object.keys(editData)) {
        if (editData[key] instanceof File) {
          console.log(`Uploading ${key}:`, editData[key]);
        }
      }

      getUserData(editData.id);
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
              <h2>Gestion Users - États & Traitements {props.slug}</h2>
              <h1>Informations sur l'utilisateur {props.slug}</h1>

              <div className="content">
                <div className="column">
                  <div style={{ display: 'flex', alignItems: 'center', color: userData.standby ? 'red' : 'green' }}>
                    {userData.standby ? 'User StandBY Mode Désactivé' : 'User activé '}
                    <Checkbox checked={userData.standby} onChange={(e) => handleStandBY(userData.id, e.target.checked)} />
                  </div>

                  <div className="item">
                    <p>Date de création : {userData.dateCreation && moment(userData.dateCreation.toDate()).format('DD MMMM YYYY')}</p>
                  </div>
                  <div className="item">
                    <p>Id : {userData.id}</p>
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
                  </div>
                  <div className="item">
                    <p>Lien : {userData.lien}</p>
                    <input type="text" name="lien" value={editData.lien || ''} onChange={handleInputChange} />
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

                  <div className="item">
                    <p>Adresses :</p>
                    {userAddresses.length > 0 ? (
                      userAddresses.map((address, index) => (
                        <div key={index}>
                          <p>{address.data.addressLine1}, {address.data.addressLine2}</p>
                          <p>{address.data.city}, {address.data.state}, {address.data.zipCode}</p>
                          <p>{address.data.country}</p>
                        </div>
                      ))
                    ) : (
                      <p>No addresses found</p>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit">Mettre à Jour</button>

              <div className="archived">
                {userData.archived ? (
                  <>
                  <Button style={{ width: '10px', height: '10px', backgroundColor: 'orange', color: 'black', fontSize: '5px' }} onClick={() => handleUnarchive(userData.id)}>Unarchive</Button>
                  </>
                ) : (
                  <Button style={{ width: '60px', height: '30px', backgroundColor: 'red', color: 'black', fontSize: '7x' }} onClick={() => handleDelete(userData.id)}>Archiver</Button>
                )}
              </div>

              <div className="item">
                <p>HISTORY :</p>
                {userHistory.length > 0 ? (
                  userHistory.map((historyItem, index) => (
                    <p key={index}>{historyItem}</p>
                  ))
                ) : (
                  <p>No history found</p>
                )}
              </div>
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
