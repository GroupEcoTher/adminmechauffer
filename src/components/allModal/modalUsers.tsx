import React, { useEffect, useState } from 'react';
import '../../components/allModal/allmodal.scss';
import { db, getDocumentById, getTempXcpByTokenID, getTempXcpByTokenPartenaire, getUserParrainbyTokenID, getParrainbyTokenID, fetchArchived } from "../../config/firebase";
import { doc, updateDoc, getDoc, collection, getDocs, addDoc, setDoc, deleteDoc } from "firebase/firestore";
import moment from 'moment';
import { Checkbox, Button, FormControlLabel, FormGroup, Collapse, IconButton } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface Props {
  setOpen: (open: boolean) => void;
  slug: string;
}

interface SectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, count, children }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {  
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

const ModalUsers: React.FC<Props> = (props: Props) => {
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

  const getUserData = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setUserData({ id: docSnapshot.id, ...data });
        setEditData({ id: docSnapshot.id, ...data });
        setUserRoles(data.roles || []);
        fetchLinkedData(data);
      } else {
        console.error("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchLinkedData = async (data: any) => {
    try {
      if (data.demandes) {
        const demandesData = await Promise.all(data.demandes.map(async (demandeId: string) => {
          const demandeRef = doc(db, "demandes", demandeId);
          const demandeDoc = await getDoc(demandeRef);
          return demandeDoc.exists() ? { id: demandeDoc.id, ...demandeDoc.data() } : null;
        }));
        const sortedDemandesData = demandesData.filter((d: any) => d !== null).sort((a: any, b: any) => {
          return b.dateCreation.seconds - a.dateCreation.seconds;
        });
        setDataDemandes(sortedDemandesData);
      }

      if (data.adresse) {
        const adresseData = await Promise.all(data.adresse.map(async (adresseId: string) => {
          const adresseRef = doc(db, "adresse", adresseId);
          const adresseDoc = await getDoc(adresseRef);
          return adresseDoc.exists() ? { id: adresseDoc.id, ...adresseDoc.data() } : null;
        }));
        setDataAdresse(adresseData.filter((a: any) => a !== null));
      }
    } catch (error) {
      console.error("Error fetching linked data:", error);
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
      return { success: true, message: `History saved for user ${userId}: ${action}` };
    } catch (error) {
      console.error("Error saving history: ", error);
      return { success: false, message: "Error saving history" };
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
        setUserData((prevData: any) => prevData && prevData.id === id ? { ...prevData, archived: true } : prevData);
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
        setUserData((prevData: any) => prevData && prevData.id === id ? { ...prevData, archived: false } : prevData);
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
      setUserData((prevData: any) => prevData && prevData.id === id ? { ...prevData, standby } : prevData);
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
      console.log("Roles fetched: ", rolesList);
      setRoles(rolesList);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchDocumentById = async (id: string) => {
    const document = await getDocumentById(id);
    console.log("Document data fetched: ", document);
    setDocumentData(document);
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
        return id;
      }));
      return parrains;
    } catch (error) {
      console.error("Error fetching parrain names:", error);
      return parrainIds;
    }
  };

  const handleFetchArchived = async () => {
    const items = await fetchArchived();
    setArchivedItems(items);
  };

  useEffect(() => {
    const url = window.location.href;
    const userId = url.substring(url.lastIndexOf('/') + 1);
    getUserData(userId);
    getRoles();
    getUserHistory(userId);

    if (userData && userData.userParrainList) {
      fetchParrainNames(userData.userParrainList).then((parrains) => {
        setUserData((prevData: any) => ({ ...prevData, userParrainList: parrains }));
      });
    }
  }, []);

  const closeModal = () => {
    props.setOpen(false);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      setEditData((prevData: any) => ({ ...prevData, [name]: files[0] }));
    } else {
      setEditData((prevData: any) => ({ ...prevData, [name]: value }));

      try {
        const userRef = doc(db, "users", editData.id);
        await updateDoc(userRef, { [name]: value });
        console.log(`${name} updated successfully`);
      } catch (error) {
        console.error(`Error updating ${name}: `, error);
      }
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setUserRoles((prevRoles) => [...prevRoles, role]);
    } else {
      setUserRoles((prevRoles) => prevRoles.filter((r) => r !== role));
    }
  };

  const AfficheImg = async (userId: string, path: string): Promise<boolean> => {
    const docRef = doc(db, "users", userId, "documents", path);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  };

  const handleViewDocument = async (userId: string, path: string, documentType: string) => {
    const documentExists = await AfficheImg(userId, path);
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
        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
          {userData ? (
            <div>
              <h2>Gestion Users - États & Traitements {props.slug}</h2>
              <h1>Informations sur l'utilisateur {props.slug}</h1>

              <div className="content">
                <div className="column">
                  <div style={{ display: 'flex', alignItems: 'left', color: userData.standby ? 'red' : 'green' }}>
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



                  <Section title="Adresses" count={dataAdresse.length}>
                    {dataAdresse.length > 0 ? (
                      dataAdresse.map((adresse, index) => (
                        <div key={index}>
                          <p><strong>Adresse</strong> {index + 1} :</p>
                          {Object.entries(adresse).map(([key, value]) => (
                            <div key={key} className="object-entry-vertical">
                              <strong>{key}:</strong>
                              <span className="value">
                                {typeof value === 'object' && value !== null ? (
                                  // Si 'value' est un objet, on l'affiche récursivement
                                  Object.entries(value).map(([subKey, subValue]) => (
                                    <div key={subKey} className="sub-entry">
                                      <strong>{subValue.key}: </strong> {/* Ajout d'un espace après le subKey */}
                                      <strong>{subValue.key}:</strong> {Array.isArray(subValue.value) ? subValue.value.join(', ') : subValue.value}
                                    </div>
                                  ))
                                ) : (
                                  // Sinon on affiche la valeur directement
                                  JSON.stringify(value)
                                )}
                              </span>
                            </div>
                          ))}
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
                          {Object.entries(demande).map(([key, value]) => (
                            <p key={key} className="object-entry">
                              <strong>{key}:</strong> <span className="value">{JSON.stringify(value)}</span>
                            </p>
                          ))}
                        </div>
                      ))
                    ) : (
                      <p>Aucune demande trouvée</p>
                    )}
                  </Section>





                  <Section title="Parrains" count={userData.userParrainList ? userData.userParrainList.length : 0}>
                    {userData.userParrainList && userData.userParrainList.map((parrain: any, index: number) => (
                      <p key={index} className="object-entry">
                        <span className="value">{parrain}</span>
                      </p>
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

              <button type="submit" style={{ backgroundColor: 'blue', 
                                             color: 'white', 
                                             padding: '5px 20px',
                                             border: 'none', 
                                             borderRadius: '5px', 
                                             marginTop: '20px' }}>METTRE A JOUR</button>

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


              <Section title="Document Data" count={documentData ? 1 : 0}>
                <Button onClick={() => fetchDocumentById(userData.id)}>Fetch Document By ID</Button>
                {documentData && (
                  <div>
                    <p>Document ID: {documentData.id}</p>
                    <pre>{JSON.stringify(documentData, null, 2)}</pre>
                  </div>
                )}
              </Section>


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
