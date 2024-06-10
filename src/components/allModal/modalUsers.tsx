import { useEffect, useState } from 'react';
import '../../components/allModal/allmodal.scss';
import { db, getDocumentById, getDataAdressebyUserID } from "../../config/firebase";
import { doc, updateDoc, getDoc, collection, getDocs, addDoc, setDoc, deleteDoc } from "firebase/firestore";
import moment from 'moment';
import { Checkbox, Button, FormControlLabel, FormGroup } from "@mui/material";

interface Props {
  setOpen: (open: boolean) => void;
  slug: string;
}

const ModalUsers = (props: Props) => {
  const [userData, setUserData] = useState<any | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [documentData, setDocumentData] = useState<any | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]); // État pour stocker les rôles de l'utilisateur
  const [dataAdresse, setDataAdresse] = useState<any | null>(null);

  

  // Fonction pour récupérer les données de l'utilisateur par ID
  const getUserData = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId); // Référence au document utilisateur
      const docSnapshot = await getDoc(userRef); // Récupère le document utilisateur
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setUserData({ id: docSnapshot.id, ...data }); // Met à jour l'état avec les données de l'utilisateur
        setEditData({ id: docSnapshot.id, ...data }); // Met à jour l'état pour l'édition des données de l'utilisateur
        setUserRoles(data.roles || []); // Met à jour l'état avec les rôles de l'utilisateur
      } else {
        console.error("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fonction pour enregistrer l'historique des actions utilisateur
  const saveHistory = async (userId: number, action: string, details: string) => {
    try {
      const historyRef = collection(db, "history"); // Référence à la collection "history"
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

  // Fonction pour supprimer et archiver un utilisateur
  const handleDelete = async (id: number) => {
    try {
      const userDocRef = doc(db, "users", id.toString()); // Référence au document utilisateur
      const userDocSnap = await getDoc(userDocRef); // Récupère le document utilisateur

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data(); // Données utilisateur
        const archiveUserDocRef = doc(db, "archiveUsers", id.toString()); // Référence au document archivé
        await setDoc(archiveUserDocRef, { ...userData, archived: true }); // Crée un document archivé
        await deleteDoc(userDocRef); // Supprime le document utilisateur

        console.log(`Deleted item with id: ${id} and archived it successfully.`);
        setUserData((prevData) => prevData && prevData.id === id ? { ...prevData, archived: true } : prevData); // Met à jour l'état
        await saveHistory(id, "archive", `User with id ${id} archived`); // Enregistre l'historique
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  // Fonction pour désarchiver un utilisateur
  const handleUnarchive = async (id: number) => {
    try {
      const archiveUserDocRef = doc(db, "archiveUsers", id.toString()); // Référence au document archivé
      const archiveUserDocSnap = await getDoc(archiveUserDocRef); // Récupère le document archivé

      if (archiveUserDocSnap.exists()) {
        const userData = archiveUserDocSnap.data(); // Données utilisateur archivées
        const userDocRef = doc(db, "users", id.toString()); // Référence au document utilisateur
        await setDoc(userDocRef, { ...userData, archived: false }); // Crée un nouveau document utilisateur
        await deleteDoc(archiveUserDocRef); // Supprime le document archivé

        console.log(`Unarchived item with id: ${id} successfully.`);
        setUserData((prevData) => prevData && prevData.id === id ? { ...prevData, archived: false } : prevData); // Met à jour l'état
        await saveHistory(id, "unarchive", `User with id ${id} unarchived`); // Enregistre l'historique
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error unarchiving document: ", error);
    }
  };

  // Fonction pour mettre un utilisateur en mode StandBY
  const handleStandBY = async (id: number, standby: boolean) => {
    try {
      const userDocRef = doc(db, "users", id.toString()); // Référence au document utilisateur
      await updateDoc(userDocRef, {
        standby: standby
      });

      console.log(`User with id: ${id} is now ${standby ? 'in StandBY mode' : 'active'}.`);
      setUserData((prevData) => prevData && prevData.id === id ? { ...prevData, standby } : prevData); // Met à jour l'état
      await saveHistory(id, "standby", `User with id ${id} set to ${standby ? 'StandBY' : 'active'}`); // Enregistre l'historique
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Fonction pour récupérer l'historique d'un utilisateur
  const getUserHistory = async (userId: string) => {
    try {
      const historyRef = collection(db, "history"); // Référence à la collection "history"
      const historySnapshot = await getDocs(historyRef); // Récupère les documents de la collection "history"
      const userHistoryData = historySnapshot.docs
        .filter(doc => doc.data().userId === userId)
        .map(doc => doc.data().description); // Filtre et mappe les données d'historique
      setUserHistory(userHistoryData); // Met à jour l'état avec les données d'historique
    } catch (error) {
      console.error("Error fetching user history:", error);
    }
  };

  // Fonction pour récupérer les rôles disponibles
  const getRoles = async () => {
    try {
      const rolesRef = collection(db, "roles"); // Référence à la collection "roles"
      const rolesSnapshot = await getDocs(rolesRef); // Récupère les documents de la collection "roles"
      const rolesList = rolesSnapshot.docs.map(doc => doc.data().name); // Mappe les noms des rôles
      console.log("Roles fetched: ", rolesList); // Affiche les rôles récupérés
      setRoles(rolesList); // Met à jour l'état avec les rôles
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Fonction pour récupérer un document par son ID
  const fetchDocumentById = async (id) => {
    const document = await getDocumentById(id); // Récupère le document par ID
    console.log("Document data fetched: ", document); // Affiche les données du document
    setDocumentData(document); // Met à jour l'état avec les données du document
  };


  const fetchDataAdresseByUserId = async (userId: string) => {
    const data = await getDataAdressebyUserID(userId);
    console.log("Address data fetched: ", data);
    setDataAdresse(data);
  };
  
  const fetchParrainNames = async (parrainIds) => {
    try {
      const parrains = await Promise.all(parrainIds.map(async (id) => {
        const userRef = doc(db, "users", id);
        const docSnapshot = await getDoc(userRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return `${data.firstname} ${data.lastname}`;
        }
        return id; // Si le document n'existe pas, retournez l'ID
      }));
      return parrains;
    } catch (error) {
      console.error("Error fetching parrain names:", error);
      return parrainIds; // En cas d'erreur, retournez les ID d'origine
    }
  };
  

//////////////////////////////////////////////////////////////////////////


  // Utilisation de useEffect pour récupérer les données utilisateur, les rôles et l'historique à l'initialisation
  useEffect(() => {
    const url = window.location.href;
    const userId = url.substring(url.lastIndexOf('/') + 1); // Récupère l'ID utilisateur depuis l'URL
    getUserData(userId); // Récupère les données utilisateur
    getRoles(); // Récupère les rôles
    getUserHistory(userId); // Récupère l'historique utilisateur

    if (userData && userData.userParrainList) {  // recupère les nom des id liés au parrain
      fetchParrainNames(userData.userParrainList).then((parrains) => {
        setUserData((prevData) => ({ ...prevData, userParrainList: parrains }));
      });
    }
  }, []);

  // Fonction pour fermer le modal
  const closeModal = () => {
    props.setOpen(false);
  };

  // Gestion des changements dans les champs de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      setEditData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setEditData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // Fonction pour gérer les changements de rôles
  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setUserRoles((prevRoles) => [...prevRoles, role]); // Ajoute le rôle à la liste des rôles
    } else {
      setUserRoles((prevRoles) => prevRoles.filter((r) => r !== role)); // Retire le rôle de la liste des rôles
    }
  };

  // Fonction pour mettre à jour les données utilisateur
  const handleUpdate = async () => {
    try {
      const userRef = doc(db, "users", editData.id); // Référence au document utilisateur
      const updatedData = { ...editData, roles: userRoles };

      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] instanceof File) {
          delete updatedData[key];
        }
      });

      await updateDoc(userRef, updatedData); // Met à jour le document utilisateur

      for (const key of Object.keys(editData)) {
        if (editData[key] instanceof File) {
          console.log(`Uploading ${key}:`, editData[key]);
        }
      }

      getUserData(editData.id); // Récupère les données utilisateur mises à jour
      closeModal(); // Ferme le modal
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
                    <p>Rôle à l'inscription : {userData.role}</p> {/* Affiche le rôle initial */}
                  </div>

                  <div className="item">
                    <p>Rôles supplémentaires :</p>
                    <FormGroup>
                      {roles.map((role, index) => (
                        <FormControlLabel
                          key={index}
                          control={
                            <Checkbox
                              checked={userRoles.includes(role)}
                              onChange={(e) => handleRoleChange(role, e.target.checked)}
                            />
                          }
                          label={role}
                        />
                      ))}
                    </FormGroup>
                  </div>

                  <div className="item">
                    <p>Civilité : {userData.civilite}</p>
                    <input type="text" name="civilite" value={editData.civilite || ''} onChange={handleInputChange} />  
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
                    <p>Validationdocument : {userData.Validationdocument}</p>
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
                    <p>Dernière mise à jour du mot de passe : {userData.lastpassupdate && moment(userData.lastpassupdate.toDate()).format('DD MMMM YYYY')}</p>
                  </div>
                  <div className="item">
                  <Button onClick={() => fetchDataAdresseByUserId(userData.id)}>Fetch Address Data By User ID</Button>
                  </div>
                  
                </div>

                <div className="column">


                  <div className="item">
                      <p>Parrains - Liste des parainés :</p>
                      {userData.userParrainList && userData.userParrainList.map((parrain, index) => (
                        <p key={index}>{parrain}</p>
                      ))}
                  </div>

 
                
                  <div className="item">
                    <p>Lien : {userData.lien}</p>
                    <input type="text" name="lien" value={editData.lien || ''} onChange={handleInputChange} />
                  </div>

                  <div className="item">
                    <p>Token Partenaire : {userData.tokenPartenaire}</p>
                    <input type="text" name="tokenPartenaire" value={editData.tokenPartenaire || ''} onChange={handleInputChange} />
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

              <div className="item">
                <Button onClick={() => fetchDocumentById(userData.id)}>Fetch Document By ID</Button>
                {documentData && (
                  <div>
                    <p>Document ID: {documentData.id}</p>
                    <pre>{JSON.stringify(documentData, null, 2)}</pre>
                  </div>
                )}
              </div>
              {/*<div className="item">
              <Button onClick={() => fetchDataAdresseByUserId(userData.id)}>Fetch Address Data By User ID</Button>
              </div>*/}


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