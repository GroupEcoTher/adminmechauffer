import React from 'react';
import { useEffect, useState } from 'react';
import '../../components/allModal/allmodal.scss';
import { db, getDocumentById, getTempXcpByTokenID, getTempXcpByTokenPartenaire, getUserParrainbyTokenID, getParrainbyTokenID, fetchArchived } from "../../config/firebase";
import { doc, updateDoc, getDoc, collection, getDocs, addDoc, setDoc, deleteDoc } from "firebase/firestore";
import moment from 'moment';
import { Checkbox, Button, FormControlLabel, FormGroup, Collapse, IconButton } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// INTERFACE PROPS POUR LE COMPOSANT ModalUsers
interface Props {
  setOpen: (open: boolean) => void;
  slug: string;
}

// Définir une interface pour les props de Section
interface SectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

// COMPONENT SECTION AVEC FONCTIONNALITÉ D'EXPANSION
const Section: React.FC<SectionProps> = ({ title, count, children }) => {
  const [open, setOpen] = useState(false);

  // fonction pour basculer l'état de l'expansion
  const handleToggle = () => {  ///Elle inverse la valeur de open: elle ouvre la section si elle est fermée et la ferme si elle est ouverte. Menu vert
    setOpen(!open);
  };

  return (
    <div className="section">
      <div className="section-header" onClick={handleToggle}>
        <h3>{title} ({count})</h3>
        <IconButton>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </div>
      <Collapse in={open}>
        <div className="section-content">
          {children}
        </div>
      </Collapse>
    </div>
  );
};


// COMPONENT PRINCIPAL POUR MODAL USERS
const ModalUsers: React.FC<Props> = (props: Props) => {
  // ÉTAT LOCAL POUR STOCKER LES DONNÉES UTILISATEURS ET AUTRES
  const [userData, setUserData] = useState<any | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [documentData, setDocumentData] = useState<any | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [dataAdresse, setDataAdresse] = useState<any[]>([]);
  const [dataDemandes, setDataDemandes] = useState<any[]>([]);
  const [tempXcpToken, setTempXcpToken] = useState<any | null>(null);
  const [tempXcpPartenaire, setTempXcpPartenaire] = useState<any | null>(null);
  const [userParrain, setUserParrain] = useState<any | null>(null);
  const [parrain, setParrain] = useState<any | null>(null);
  const [archivedItems, setArchivedItems] = useState<any[]>([]);
  const [documentVerification, setDocumentVerification] = useState<any>({});
  const [documentDisplayed, setDocumentDisplayed] = useState<any>({});

  // FONCTION POUR RÉCUPÉRER LES DONNÉES UTILISATEUR PAR ID
  const getUserData = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId); // Référence au document utilisateur
      const docSnapshot = await getDoc(userRef); // Récupérer le document utilisateur
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setUserData({ id: docSnapshot.id, ...data }); // Mettre à jour les données utilisateur
        setEditData({ id: docSnapshot.id, ...data }); // Initialiser les données d'édition
        setUserRoles(data.roles || []); // Mettre à jour les rôles utilisateur
        fetchLinkedData(data); // Récupérer les données liées (adresses et demandes)
      } else {
        console.error("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  
  // FONCTION POUR RÉCUPÉRER LES DONNÉES LIÉES (ADRESSES ET DEMANDES)
  const fetchLinkedData = async (data: any) => {
    try {
      if (data.demandes) {
        const demandesData = await Promise.all(data.demandes.map(async (demandeId: string) => {
          const demandeRef = doc(db, "demandes", demandeId); // Référence à chaque demande
          const demandeDoc = await getDoc(demandeRef); // Récupérer le document de la demande
          return demandeDoc.exists() ? { id: demandeDoc.id, ...demandeDoc.data() } : null;
        }));
        const sortedDemandesData = demandesData.filter((d: any) => d !== null).sort((a: any, b: any) => {
          return b.dateCreation.seconds - a.dateCreation.seconds;
        });
        setDataDemandes(sortedDemandesData); // Mettre à jour les demandes
      }

      if (data.adresse) {
        const adresseData = await Promise.all(data.adresse.map(async (adresseId: string) => {
          const adresseRef = doc(db, "adresse", adresseId); // Référence à chaque adresse
          const adresseDoc = await getDoc(adresseRef); // Récupérer le document de l'adresse
          return adresseDoc.exists() ? { id: adresseDoc.id, ...adresseDoc.data() } : null;
        }));
        setDataAdresse(adresseData.filter((a: any) => a !== null)); // Mettre à jour les adresses
      }
    } catch (error) {
      console.error("Error fetching linked data:", error);
    }
  };

  // FONCTION POUR ENREGISTRER L'HISTORIQUE DES ACTIONS UTILISATEUR
  const saveHistory = async (userId: number, action: string, details: string) => {
    try {
      const historyRef = collection(db, "history"); // Référence à la collection historique
      await addDoc(historyRef, {
        userId,
        action,
        details,
        timestamp: new Date(),
      });
      console.log(`History saved for user ${userId}: ${action}`);
      return { success: true, message: `History saved for user ${userId}: ${action}` };
    } catch (error) {
      console.error("Error saving history: ", error);
      return { success: false, message: "Error saving history" };
    }
  };
  

  // FONCTION POUR SUPPRIMER UN UTILISATEUR (ARCHIVER)
  const handleDelete = async (id: number) => {
    try {
      const userDocRef = doc(db, "users", id.toString()); // Référence au document utilisateur
      const userDocSnap = await getDoc(userDocRef); // Récupérer le document utilisateur

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const archiveUserDocRef = doc(db, "archiveUsers", id.toString()); // Référence au document archivé
        await setDoc(archiveUserDocRef, { ...userData, archived: true }); // Archiver les données utilisateur
        await deleteDoc(userDocRef); // Supprimer le document utilisateur

        console.log(`Deleted item with id: ${id} and archived it successfully.`);
        setUserData((prevData: any) => prevData && prevData.id === id ? { ...prevData, archived: true } : prevData); // Mettre à jour les données utilisateur
        await saveHistory(id, "archive", `User with id ${id} archived`); // Enregistrer l'historique
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

// FONCTION POUR DÉSARCHIVER UN UTILISATEUR
const handleUnarchive = async (id: number) => {
  try {
    // Référence au document archivé
    const archiveUserDocRef = doc(db, "archiveUsers", id.toString());
    // Récupérer le document archivé
    const archiveUserDocSnap = await getDoc(archiveUserDocRef);

    // Vérifier si le document archivé existe
    if (archiveUserDocSnap.exists()) {
      // Récupérer les données utilisateur depuis le document archivé
      const userData = archiveUserDocSnap.data();
      // Référence au document utilisateur dans la collection "users"
      const userDocRef = doc(db, "users", id.toString());
      // Copier les données utilisateur dans la collection "users" et définir "archived" à false
      await setDoc(userDocRef, { ...userData, archived: false });
      // Supprimer le document archivé
      await deleteDoc(archiveUserDocRef);

      console.log(`Unarchived item with id: ${id} successfully.`);
      // Mettre à jour les données utilisateur dans l'état local
      setUserData((prevData: any) => prevData && prevData.id === id ? { ...prevData, archived: false } : prevData);
      // Enregistrer l'historique de l'action de désarchivage
      await saveHistory(id, "unarchive", `User with id ${id} unarchived`);
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error unarchiving document: ", error);
  }
};


  // FONCTION POUR METTRE UN UTILISATEUR EN MODE STANDBY
  const handleStandBY = async (id: number, standby: boolean) => {
    try {
      const userDocRef = doc(db, "users", id.toString()); // Référence au document utilisateur
      await updateDoc(userDocRef, {
        standby: standby
      });

      console.log(`User with id: ${id} is now ${standby ? 'in StandBY mode' : 'active'}.`);
      setUserData((prevData: any) => prevData && prevData.id === id ? { ...prevData, standby } : prevData); // Mettre à jour les données utilisateur
      await saveHistory(id, "standby", `User with id ${id} set to ${standby ? 'StandBY' : 'active'}`); // Enregistrer l'historique
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // FONCTION POUR RÉCUPÉRER L'HISTORIQUE UTILISATEUR
  const getUserHistory = async (userId: string) => {
    try {
      const historyRef = collection(db, "history"); // Référence à la collection historique
      const historySnapshot = await getDocs(historyRef); // Récupérer les documents historiques
      const userHistoryData = historySnapshot.docs
        .filter(doc => doc.data().userId === userId)
        .map(doc => doc.data().description);
      setUserHistory(userHistoryData); // Mettre à jour l'historique utilisateur
    } catch (error) {
      console.error("Error fetching user history:", error);
    }
  };

  // FONCTION POUR RÉCUPÉRER LES RÔLES DISPONIBLES
  const getRoles = async () => {
    try {
      const rolesRef = collection(db, "roles"); // Référence à la collection des rôles
      const rolesSnapshot = await getDocs(rolesRef); // Récupérer les documents de rôles
      const rolesList = rolesSnapshot.docs.map(doc => doc.data().name);
      console.log("Roles fetched: ", rolesList);
      setRoles(rolesList); // Mettre à jour la liste des rôles
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // FONCTION POUR RÉCUPÉRER LES DONNÉES DU DOCUMENT PAR ID
  const fetchDocumentById = async (id: string) => {
    const document = await getDocumentById(id); // Récupérer le document par ID
    console.log("Document data fetched: ", document);
    setDocumentData(document); // Mettre à jour les données du document
  };

  // FONCTION POUR RÉCUPÉRER TempXcp PAR TOKEN ID
  const fetchTempXcpByTokenId = async (tokenId: string) => {
    const data = await getTempXcpByTokenID(tokenId); // Récupérer les données TempXcp par Token ID
    console.log("TempXcp data fetched by Token ID: ", data);
    setTempXcpToken(data); // Mettre à jour les données TempXcp
  };

  // FONCTION POUR RÉCUPÉRER TempXcp PAR TOKEN PARTENAIRE
  const fetchTempXcpByTokenPartenaire = async (tokenPartenaire: string) => {
    const data = await getTempXcpByTokenPartenaire(tokenPartenaire); // Récupérer les données TempXcp par Token Partenaire
    console.log("TempXcp data fetched by Token Partenaire: ", data);
    setTempXcpPartenaire(data); // Mettre à jour les données TempXcp
  };

  // FONCTION POUR RÉCUPÉRER USER PARRAIN PAR TOKEN ID
  const fetchUserParrainByTokenId = async (tokenId: string) => {
    const data = await getUserParrainbyTokenID(tokenId); // Récupérer les données du parrain utilisateur par Token ID
    console.log("User Parrain data fetched by Token ID: ", data);
    setUserParrain(data); // Mettre à jour les données du parrain utilisateur
  };

  // FONCTION POUR RÉCUPÉRER PARRAIN PAR TOKEN ID
  const fetchParrainByTokenId = async (tokenId: string) => {
    const data = await getParrainbyTokenID(tokenId); // Récupérer les données du parrain par Token ID
    console.log("Parrain data fetched by Token ID: ", data);
    setParrain(data); // Mettre à jour les données du parrain
  };

  // FONCTION POUR RÉCUPÉRER LES NOMS DES PARRAINS
  const fetchParrainNames = async (parrainIds: string[]) => {
    try {
      const parrains = await Promise.all(parrainIds.map(async (id) => {
        const userRef = doc(db, "users", id); // Référence au document utilisateur
        const docSnapshot = await getDoc(userRef); // Récupérer le document utilisateur
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return `${data.firstname} ${data.lastname}`;
        }
        return id;
      }));
      return parrains; // Retourner les noms des parrains
    } catch (error) {
      console.error("Error fetching parrain names:", error);
      return parrainIds;
    }
  };

  // FONCTION POUR RÉCUPÉRER LES ÉLÉMENTS ARCHIVÉS
  const handleFetchArchived = async () => {
    const items = await fetchArchived(); // Récupérer les éléments archivés
    setArchivedItems(items); // Mettre à jour les éléments archivés
  };

  // EFFET POUR RÉCUPÉRER LES DONNÉES INITIALES
  useEffect(() => {
    const url = window.location.href;
    const userId = url.substring(url.lastIndexOf('/') + 1); // Extraire l'ID utilisateur de l'URL
    getUserData(userId); // Récupérer les données utilisateur
    getRoles(); // Récupérer les rôles disponibles
    getUserHistory(userId); // Récupérer l'historique utilisateur

    if (userData && userData.userParrainList) {
      fetchParrainNames(userData.userParrainList).then((parrains) => {
        setUserData((prevData: any) => ({ ...prevData, userParrainList: parrains })); // Mettre à jour les noms des parrains
      });
    }
  }, []);

  // FONCTION POUR FERMER LA MODALE
  const closeModal = () => {
    props.setOpen(false);
  };

  // FONCTION POUR GÉRER LE CHANGEMENT D'ENTRÉE
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      setEditData((prevData: any) => ({ ...prevData, [name]: files[0] })); // Mettre à jour les données d'édition avec le fichier sélectionné
    } else {
      setEditData((prevData: any) => ({ ...prevData, [name]: value })); // Mettre à jour les données d'édition avec la nouvelle valeur

      try {
        const userRef = doc(db, "users", editData.id); // Référence au document utilisateur
        await updateDoc(userRef, { [name]: value }); // Mettre à jour le document utilisateur
        console.log(`${name} updated successfully`);
      } catch (error) {
        console.error(`Error updating ${name}: `, error);
      }
    }
  };

  // FONCTION POUR GÉRER LE CHANGEMENT DE RÔLE
  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setUserRoles((prevRoles) => [...prevRoles, role]); // Ajouter le rôle sélectionné
    } else {
      setUserRoles((prevRoles) => prevRoles.filter((r) => r !== role)); // Supprimer le rôle désélectionné
    }
  };

  const AfficheImg = async (userId: string, path: string): Promise<boolean> => {
    // Utilisez les paramètres pour la logique de la fonction
    // Par exemple, vous pouvez vérifier l'existence du document dans Firebase
    const docRef = doc(db, "users", userId, "documents", path);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  };
  

// FONCTION POUR AFFICHER LE DOCUMENT
const handleViewDocument = async (userId: string, path: string, documentType: string) => {
  const documentExists = await AfficheImg(userId, path); // Vérifier si le document existe
  if (documentExists) {
    setDocumentDisplayed((prevState: any) => ({
      ...prevState,
      [userId]: {
        ...prevState[userId],
        [documentType]: true,
      },
    }));
  } else {
    setDocumentDisplayed((prevState: any) => ({
      ...prevState,
      [userId]: {
        ...prevState[userId],
        [documentType]: false,
      },
    }));
  }
};

  // FONCTION POUR METTRE À JOUR LES DONNÉES UTILISATEUR
  const handleUpdate = async () => {
    try {
      const userRef = doc(db, "users", editData.id); // Référence au document utilisateur
      const updatedData = { ...editData, roles: userRoles }; // Préparer les données mises à jour

      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] instanceof File) {
          delete updatedData[key]; // Supprimer les fichiers des données mises à jour
        }
      });

      await updateDoc(userRef, updatedData); // Mettre à jour le document utilisateur

      for (const key of Object.keys(editData)) {
        if (editData[key] instanceof File) {
          console.log(`Uploading ${key}:`, editData[key]); // Télécharger les fichiers séparément
        }
      }

      getUserData(editData.id); // Récupérer les données utilisateur mises à jour
      closeModal(); // Fermer la modale
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <div className="add">
      <div className="modal">
        {/* FORMULAIRE POUR MODIFIER LES DONNÉES UTILISATEUR */}
        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
          {userData ? (
            <div>
              <h2>Gestion Users - États & Traitements {props.slug}</h2>
              <h1>Informations sur l'utilisateur {props.slug}</h1>

              <div className="content" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="column" style={{ flex: 1, marginRight: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'left', color: userData.standby ? 'red' : 'green' }}>

                    {/* CHECKBOX POUR LE MODE STANDBY */}
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

                  {/* SECTION POUR LES RÔLES SUPPLÉMENTAIRES */}
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
                    <select name="civilite" value={editData.civilite || ''} onChange={handleInputChange}>
                      <option value="">Sélectionnez</option>
                      <option value="Madame">Madame</option>
                      <option value="Monsieur">Monsieur</option>
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

                  {/* SECTION POUR LA VALIDATION DES DOCUMENTS */}
                  <div className="item">
                    <p>Validation document : {userData.validationDocument ? "Validé" : "Non Validé"}</p>
                    <div className="document-verification">
                      <Button
                        className={`button-view ${documentDisplayed[userData.id]?.identityDocumentDisplayed ? 'has-document' : ''}`}
                        style={{ color: documentDisplayed[userData.id]?.identityDocumentDisplayed ? 'orange' : '' }}
                        onClick={() => handleViewDocument(userData.id, 'ci0.png', 'identityDocumentDisplayed')}
                      >
                        Voir Pièce Identité
                      </Button>
                      <Checkbox
                        className="checkbox"
                        checked={documentVerification[userData.id]?.identityDocumentVerified}
                        disabled={!documentDisplayed[userData.id]?.identityDocumentDisplayed}
                        onChange={(e) => {
                          if (documentDisplayed[userData.id]?.identityDocumentDisplayed) {
                            const updatedVerification = {
                              ...documentVerification,
                              [userData.id]: {
                                ...documentVerification[userData.id],
                                identityDocumentVerified: e.target.checked,
                                identityDocumentNC: !e.target.checked,
                              },
                            };
                            setDocumentVerification(updatedVerification);
                          }
                        }}
                      />
                      <Checkbox
                        className="checkbox orange"
                        style={{ marginLeft: '1px' }}
                        checked={documentVerification[userData.id]?.identityDocumentNC}
                        onChange={(e) => {
                          if (documentDisplayed[userData.id]?.identityDocumentDisplayed) {
                            const updatedVerification = {
                              ...documentVerification,
                              [userData.id]: {
                                ...documentVerification[userData.id],
                                identityDocumentNC: e.target.checked,
                                identityDocumentVerified: !e.target.checked,
                              },
                            };
                            setDocumentVerification(updatedVerification);
                          }
                        }}
                      />
                      <span className="nc-circle">NC</span>
                    </div>
                    <div className="document-verification">
                      <Button
                        className={`button-view ${documentDisplayed[userData.id]?.taxNoticeDisplayed ? 'has-document' : ''}`}
                        style={{ color: documentDisplayed[userData.id]?.taxNoticeDisplayed ? 'orange' : '' }}
                        onClick={() => handleViewDocument(userData.id, 'impot0.png', 'taxNoticeDisplayed')}
                      >
                        Voir Avis D'impôts
                      </Button>
                      <Checkbox
                        className="checkbox"
                        checked={documentVerification[userData.id]?.taxNoticeVerified}
                        disabled={!documentDisplayed[userData.id]?.taxNoticeDisplayed}
                        onChange={(e) => {
                          if (documentDisplayed[userData.id]?.taxNoticeDisplayed) {
                            const updatedVerification = {
                              ...documentVerification,
                              [userData.id]: {
                                ...documentVerification[userData.id],
                                taxNoticeVerified: e.target.checked,
                                taxNoticeNC: !e.target.checked,
                              },
                            };
                            setDocumentVerification(updatedVerification);
                          }
                        }}
                      />
                      <Checkbox
                        className="checkbox orange"
                        style={{ marginLeft: '1px' }}
                        checked={documentVerification[userData.id]?.taxNoticeNC}
                        onChange={(e) => {
                          if (documentDisplayed[userData.id]?.taxNoticeDisplayed) {
                            const updatedVerification = {
                              ...documentVerification,
                              [userData.id]: {
                                ...documentVerification[userData.id],
                                taxNoticeNC: e.target.checked,
                                taxNoticeVerified: !e.target.checked,
                              },
                            };
                            setDocumentVerification(updatedVerification);
                          }
                        }}
                      />
                      <span className="nc-circle">NC</span>
                    </div>
                  </div>

                  <div className="item">
                    <p>Dernière mise à jour du mot de passe : {userData.lastpassupdate && moment(userData.lastpassupdate.toDate()).format('DD MMMM YYYY')}</p>
                  </div>
                </div>

                {/* COLONNE POUR LES SECTIONS ADRESSES, DEMANDES ET PARRAINS */}
                <div className="column" style={{ flex: 1, marginLeft: '10px' }}>
                  <Section title="Adresses" count={dataAdresse.length}>
                    {dataAdresse.length > 0 ? (
                      dataAdresse.map((adresse, index) => (
                        <div key={index}>
                          <p>Adresse {index + 1} :</p>
                          <pre>{JSON.stringify(adresse, null, 2)}</pre>
                        </div>
                      ))
                    ) : (
                      <p>Aucune adresse trouvée</p>
                    )}
                  </Section>

                  <Section title="Demandes" count={dataDemandes.length}>
                    {dataDemandes.length > 0 ? (
                      dataDemandes.map((demande, index) => (
                        <div key={index}>
                          <p>Demande {index + 1} :</p>
                          <pre>{JSON.stringify(demande, null, 2)}</pre>
                        </div>
                      ))
                    ) : (
                      <p>Aucune demande trouvée</p>
                    )}
                  </Section>

                  <Section title="Parrains" count={userData.userParrainList ? userData.userParrainList.length : 0}>
                    {userData.userParrainList && userData.userParrainList.map((parrain: any, index: number) => (
                      <p key={index}>{parrain}</p>
                    ))}
                  </Section>

                  <div className="item">
                    <p>Lien : {userData.lien}</p>
                    <input type="text" name="lien" value={editData.lien || ''} onChange={handleInputChange} />
                  </div>

                  <div className="item">
                    <p>Token Partenaire : {userData.tokenPartenaire}</p>
                    <input type="text" name="tokenPartenaire" value={editData.tokenPartenaire || ''} onChange={handleInputChange} />
                  </div>

                  {/* SECTION POUR LES DONNÉES TempXcp */}
                  <Section title="TempXcp By Token ID" count={tempXcpToken ? 1 : 0}>
                    <Button onClick={() => fetchTempXcpByTokenId(userData.tokenPartenaire)}>Fetch TempXcp By Token ID</Button>
                    {tempXcpToken && (
                      <div>
                        <h3>TempXcp Data By Token ID:</h3>
                        <pre>{JSON.stringify(tempXcpToken, null, 2)}</pre>
                      </div>
                    )}
                  </Section>

                  <Section title="TempXcp By Token Partenaire" count={tempXcpPartenaire ? 1 : 0}>
                    <Button onClick={() => fetchTempXcpByTokenPartenaire(userData.tokenPartenaire)}>Fetch TempXcp By Token Partenaire</Button>
                    {tempXcpPartenaire && (
                      <div>
                        <h3>TempXcp Data By Token Partenaire:</h3>
                        <pre>{JSON.stringify(tempXcpPartenaire, null, 2)}</pre>
                      </div>
                    )}
                  </Section>

                  {/* SECTION POUR LES DONNÉES USER PARRAIN */}
                  <Section title="User Parrain By Token ID" count={userParrain ? 1 : 0}>
                    <Button onClick={() => fetchUserParrainByTokenId(userData.tokenPartenaire)}>Fetch User Parrain By Token ID</Button>
                    {userParrain && (
                      <div>
                        <h3>User Parrain Data By Token ID:</h3>
                        <pre>{JSON.stringify(userParrain, null, 2)}</pre>
                      </div>
                    )}
                  </Section>

                  <Section title="Parrain By Token ID" count={parrain ? 1 : 0}>
                    <Button onClick={() => fetchParrainByTokenId(userData.tokenPartenaire)}>Fetch Parrain By Token ID</Button>
                    {parrain && (
                      <div>
                        <h3>Parrain Data By Token ID:</h3>
                        <pre>{JSON.stringify(parrain, null, 2)}</pre>
                      </div>
                    )}
                  </Section>
                </div>
              </div>

              {/* BOUTON POUR METTRE À JOUR LES DONNÉES */}
              <button type="submit" style={{ backgroundColor: 'blue', 
                                             color: 'white', 
                                             padding: '5px 20px',
                                             border: 'none', 
                                             borderRadius: '5px', 
                                             marginTop: '20px' }}>METTRE  A  JOUR</button>

              {/* SECTION POUR LES ACTIONS D'ARCHIVAGE/DÉSARCHIVAGE */}
              <div className="archived" style={{ marginTop: '60px' }}>
                {userData.archived ? (
                  <>
                    <Button style={{ backgroundColor: 'orange', 
                                     color: 'black', 
                                     fontSize: '12px', 
                                     padding: '5px 10px' }} onClick={() => handleUnarchive(userData.id)}>Unarchive</Button>
                  </>
                ) : (
                  <Button style={{ backgroundColor: 'red', 
                                   color: 'white', 
                                   fontSize: '12px', padding: '5px 10px' }} onClick={() => handleDelete(userData.id)}>Archiver</Button>
                )}
              </div>

              {/* SECTION POUR L'HISTORIQUE */}
              <Section title="History" count={userHistory.length}>
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
              </Section>

              {/* SECTION POUR LES DONNÉES DE DOCUMENT */}
              <Section title="Document Data" count={documentData ? 1 : 0}>
                <Button onClick={() => fetchDocumentById(userData.id)}>Fetch Document By ID</Button>
                {documentData && (
                  <div>
                    <p>Document ID: {documentData.id}</p>
                    <pre>{JSON.stringify(documentData, null, 2)}</pre>
                  </div>
                )}
              </Section>

              {/* SECTION POUR LES ÉLÉMENTS ARCHIVÉS */}
              <Section title="Archived Items" count={archivedItems.length}>
                <Button onClick={handleFetchArchived}>Afficher les éléments archivés</Button>
                {archivedItems.length > 0 && (
                  <div>
                    <h3>Archived Items:</h3>
                    <pre>{JSON.stringify(archivedItems, null, 2)}</pre>
                  </div>
                )}
              </Section>
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
