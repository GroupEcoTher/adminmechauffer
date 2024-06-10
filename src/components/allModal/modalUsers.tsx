import { useEffect, useState } from 'react';
import '../../components/allModal/allmodal.scss';
import { db, getDocumentById, getDataAdressebyUserID, getDataDemandesbyUserID, getTempXcpByTokenID, getTempXcpByTokenPartenaire, getUserParrainbyTokenID, getParrainbyTokenID } from "../../config/firebase";
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
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [dataAdresse, setDataAdresse] = useState<any | null>(null);
  const [dataDemandes, setDataDemandes] = useState<any | null>(null);
  const [tempXcpToken, setTempXcpToken] = useState<any | null>(null);
  const [tempXcpPartenaire, setTempXcpPartenaire] = useState<any | null>(null);
  const [userParrain, setUserParrain] = useState<any | null>(null);
  const [parrain, setParrain] = useState<any | null>(null);

  // Fonction pour récupérer les données de l'utilisateur par ID
  const getUserData = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setUserData({ id: docSnapshot.id, ...data });
        setEditData({ id: docSnapshot.id, ...data });
        setUserRoles(data.roles || []);
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

  // Fonction pour supprimer et archiver un utilisateur
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

  // Fonction pour désarchiver un utilisateur
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

  // Fonction pour mettre un utilisateur en mode StandBY
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

  // Fonction pour récupérer l'historique d'un utilisateur
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

  // Fonction pour récupérer les rôles disponibles
  const getRoles = async () => {
    try {
      const rolesRef = collection(db, "roles");
      const rolesSnapshot = await getDocs(rolesRef);
      const rolesList = rolesSnapshot.docs.map(doc => doc.data().name);
      console.log("Roles fetched: ", rolesList);
      setRoles(rolesList);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Fonction pour récupérer un document par son ID
  const fetchDocumentById = async (id: string) => {
    const document = await getDocumentById(id);
    console.log("Document data fetched: ", document);
    setDocumentData(document);
  };

  const fetchDataAdresseByUserId = async (userId: string) => {
    const data = await getDataAdressebyUserID(userId);
    console.log("Address data fetched: ", data);
    setDataAdresse(data);
  };

  const fetchDataDemandesByUserId = async (userId: string) => {
    const data = await getDataDemandesbyUserID(userId);
    console.log("Demandes data fetched: ", data);

    // Trier les demandes par date de création
    const sortedData = data.sort((a: any, b: any) => {
      const dateA = a.data.dateCreation.seconds * 1000 + a.data.dateCreation.nanoseconds / 1000000;
      const dateB = b.data.dateCreation.seconds * 1000 + b.data.dateCreation.nanoseconds / 1000000;
      return dateB - dateA;
    });

    setDataDemandes(sortedData);
  };

  const fetchTempXcpByTokenId = async (tokenId: string) => {
    const data = await getTempXcpByTokenID(tokenId);
    console.log("TempXcp data fetched by Token ID: ", data);
    setTempXcpToken(data);
  };

  const fetchTempXcpByTokenPartenaire = async (tokenPartenaire: string) => {
    const data = await getTempXcpByTokenPartenaire(tokenPartenaire);
    console.log("TempXcp data fetched by Token Partenaire: ", data);
    setTempXcpPartenaire(data);
  };

  const fetchUserParrainByTokenId = async (tokenId: string) => {
    const data = await getUserParrainbyTokenID(tokenId);
    console.log("User Parrain data fetched by Token ID: ", data);
    setUserParrain(data);
  };

  const fetchParrainByTokenId = async (tokenId: string) => {
    const data = await getParrainbyTokenID(tokenId);
    console.log("Parrain data fetched by Token ID: ", data);
    setParrain(data);
  };

  const fetchParrainNames = async (parrainIds: string[]) => {
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

  // Utilisation de useEffect pour récupérer les données utilisateur, les rôles et l'historique à l'initialisation
  useEffect(() => {
    const url = window.location.href;
    const userId = url.substring(url.lastIndexOf('/') + 1);
    getUserData(userId);
    getRoles();
    getUserHistory(userId);

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
      setUserRoles((prevRoles) => [...prevRoles, role]);
    } else {
      setUserRoles((prevRoles) => prevRoles.filter((r) => r !== role));
    }
  };

  // Fonction pour mettre à jour les données utilisateur
  const handleUpdate = async () => {
    try {
      const userRef = doc(db, "users", editData.id);
      const updatedData = { ...editData, roles: userRoles };

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
                    <p>Rôle à l'inscription : {userData.role}</p>
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
                    {dataAdresse && (
                      <div>
                        <h3>Address Data:</h3>
                        <pre>{JSON.stringify(dataAdresse, null, 2)}</pre>
                      </div>
                    )}
                  </div>

                  <div className="item">
                    <Button onClick={() => fetchDataDemandesByUserId(userData.id)}>Fetch Demandes Data By User ID</Button>
                    {dataDemandes && (
                      <div>
                        <h3>Demandes Data:</h3>
                        <pre>{JSON.stringify(dataDemandes, null, 2)}</pre>
                      </div>
                    )}
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

                  <div className="item">
                    <Button onClick={() => fetchTempXcpByTokenId(userData.tokenPartenaire)}>Fetch TempXcp By Token ID</Button>
                    {tempXcpToken && (
                      <div>
                        <h3>TempXcp Data By Token ID:</h3>
                        <pre>{JSON.stringify(tempXcpToken, null, 2)}</pre>
                      </div>
                    )}
                  </div>

                  <div className="item">
                    <Button onClick={() => fetchTempXcpByTokenPartenaire(userData.tokenPartenaire)}>Fetch TempXcp By Token Partenaire</Button>
                    {tempXcpPartenaire && (
                      <div>
                        <h3>TempXcp Data By Token Partenaire:</h3>
                        <pre>{JSON.stringify(tempXcpPartenaire, null, 2)}</pre>
                      </div>
                    )}
                  </div>

                  <div className="item">
                    <Button onClick={() => fetchUserParrainByTokenId(userData.tokenPartenaire)}>Fetch User Parrain By Token ID</Button>
                    {userParrain && (
                      <div>
                        <h3>User Parrain Data By Token ID:</h3>
                        <pre>{JSON.stringify(userParrain, null, 2)}</pre>
                      </div>
                    )}
                  </div>

                  <div className="item">
                    <Button onClick={() => fetchParrainByTokenId(userData.tokenPartenaire)}>Fetch Parrain By Token ID</Button>
                    {parrain && (
                      <div>
                        <h3>Parrain Data By Token ID:</h3>
                        <pre>{JSON.stringify(parrain, null, 2)}</pre>
                      </div>
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

              <div className="item">
                <Button onClick={() => fetchDocumentById(userData.id)}>Fetch Document By ID</Button>
                {documentData && (
                  <div>
                    <p>Document ID: {documentData.id}</p>
                    <pre>{JSON.stringify(documentData, null, 2)}</pre>
                  </div>
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
