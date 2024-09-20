import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getData, getTotalUsers } from "../../config/firebase";
import { collection, getDocs, getFirestore, setDoc, deleteDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import { app } from "../../config/firebase";
import './FullLengthBox.scss';
import './UsersHome.scss';


// Ajout de la fonction personnalisée pour formater les timestamps Firebase
const formatFirebaseTimestamp = (timestamp: any) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const db = getFirestore(app);

interface UsersHomeProps {
  title: string;
}

interface FullLengthBoxProps {
  totalUsers: number;
}

// Composant FullLengthBox
const FullLengthBox: React.FC<FullLengthBoxProps> = ({ totalUsers }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => (location.pathname === path ? 'active' : '');
  return (
    <div className="fullLengthBox">
      <button className={`hoverEffect ${isActive('/UsersHome')}`} onClick={() => navigate('/UsersHome')}>
        Home Users <span className="total-users">{totalUsers ? `(${totalUsers})` : ''}</span>
      </button>
      <button className={`hoverEffect ${isActive('/UsersTraitements')}`} onClick={() => navigate('/UsersTraitements')}>
        Gestion Users <br /> États traitements
      </button>
      <button className={`hoverEffect ${isActive('/RecepMail')}`} onClick={() => navigate('/RecepMail')}> 
        Réception Mails
      </button>
      <button className={`hoverEffect ${isActive('/QuestDem')}`} onClick={() => navigate('/QuestDem')}>
        Questions Demandes via le Site
      </button>
      <button className={`hoverEffect ${isActive('/HistAction')}`} onClick={() => navigate('/HistAction')}>
        Historique des actions Résumé d’utilisation
      </button>
      <button className={`hoverEffect ${isActive('/AideDoc')}`} onClick={() => navigate('/AideDoc')}>
        Aide <br />Documentation
      </button>
    </div>
  );
};

// Composant principal UsersHome
const UsersHome: React.FC<UsersHomeProps> = ({ title }) => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [adresse, setAdresse] = useState<any[]>([]);
  const [archiveUsers, setArchiveUsers] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [users, setUserState] = useState<any[]>([]);
  const [statusNonVerifieeUsers, setStatusNonVerifieeUsers] = useState<any[]>([]);
  const [devis, setDevis] = useState<any[]>([]); // Ajout de l'état pour "devis"
  const [selectedCollection, setSelectedCollection] = useState<any[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [expandedUsers, setExpandedUsers] = useState<{ [key: string]: boolean }>({});
  const [expandedDevis, setExpandedDevis] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatedUserId, setUpdatedUserId] = useState<string | null>(null); // Nouvel état pour suivre l'utilisateur mis à jour
  const [errorUserId, setErrorUserId] = useState<string | null>(null); // Nouvel état pour suivre l'utilisateur qui a rencontré une erreur

  // Définir des états pour le total de chaque collection
  const [totalArchiveUsers, setTotalArchiveUsers] = useState<number>(0);
  const [totalAdresses, setTotalAdresses] = useState<number>(0);
  const [totalDemandes, setTotalDemandes] = useState<number>(0);
  const [totalStatusNonVerifieeUsers, setTotalStatusNonVerifieeUsers] = useState<number>(0);
  const [totalDevis, setTotalDevis] = useState<number>(0); // Ajout de l'état pour le total des devis




  // Fetch des données Firestore pour "users" et "totalUsers"
  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getData();
      const totalUsersCount = await getTotalUsers();
      setUserState(usersData);
      setTotalUsers(totalUsersCount);

      // Filtrer les utilisateurs avec le statut "Non Vérifiée"
      const statusNonVerifiee = usersData.filter((user: any) => user.status === "Non Vérifiée");
      setStatusNonVerifieeUsers(statusNonVerifiee);
      setTotalStatusNonVerifieeUsers(statusNonVerifiee.length);
    };
    fetchData();
  }, []);




  useEffect(() => {
    const fetchDevis = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const allDevis: { id: string; [key: string]: any }[] = [];
  
        for (const userDoc of usersSnapshot.docs) {
          const additionalDataRef = doc(userDoc.ref, 'additionalData');
          const additionalDataSnapshot = await getDoc(additionalDataRef);
          if (additionalDataSnapshot.exists()) {
            const devisCollection = collection(additionalDataRef, 'devis');
            const devisSnapshot = await getDocs(devisCollection);
            devisSnapshot.forEach((devisDoc) => {
              allDevis.push({ id: devisDoc.id, ...devisDoc.data() });
            });
          }
        }
  
        setDevis(allDevis);
        setTotalDevis(allDevis.length);
      } catch (error) {
        console.error("Erreur lors de la récupération des devis :", error);
      }
    };
  
    fetchDevis();
  }, []);

  
  // Fetch des collections Firestore
  useEffect(() => {
    const fetchCollection = async (collectionName: string, setState: React.Dispatch<React.SetStateAction<any[]>>) => {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const dataList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setState(dataList);
        
        // Mettre à jour les totaux en fonction de la collection
        if (collectionName === 'adresse') {
          setTotalAdresses(querySnapshot.size);
        } else if (collectionName === 'archiveUsers') {
          setTotalArchiveUsers(querySnapshot.size);
        } else if (collectionName === 'demandes') {
          setTotalDemandes(querySnapshot.size);
        } else if (collectionName === 'devis') {
          setTotalDevis(querySnapshot.size);
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération de la collection ${collectionName}:`, error);
      }
    };
    
    // Appeler la fonction pour chaque collection
    fetchCollection('adresse', setAdresse);
    fetchCollection('archiveUsers', setArchiveUsers);
    fetchCollection('demandes', setDemandes);
    fetchCollection('history', setHistory);
    fetchCollection('devis', setDevis); // Ajout de la collection "devis"
  }, []);

  // Fonction pour mettre à jour l'état de l'utilisateur dans Firestore
  const updateUserState = async (userId: string, updatedData: Partial<{ archived: boolean; standby: boolean; status: string }>) => {
    setLoading(true); // Activer le chargement
    setSuccessMessage(null);
    setErrorMessage(null);
    setUpdatedUserId(null); // Réinitialiser l'ID de l'utilisateur mis à jour
    setErrorUserId(null); // Réinitialiser l'ID de l'utilisateur qui a rencontré une erreur

    try {
      const userRef = doc(db, "users", userId); // Référence au document dans users
      await updateDoc(userRef, updatedData);  // Mise à jour dans users

      if (updatedData.archived === false) {
        // Déplacer l'utilisateur vers la collection 'users' si non archivé
        const userData = (await getDoc(userRef)).data();  // Récupère les données utilisateur
        await setDoc(doc(db, "users", userId), userData);  // Ajoute l'utilisateur à la collection 'users'
        await deleteDoc(userRef);  // Supprime l'utilisateur de 'archiveUsers'
      }



      // Mettre à jour l'état local pour refléter les changements
      setUserState((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user.id === userId ? { ...user, ...updatedData } : user
        );
        return updatedUsers;
      });




      // Mettre à jour les collections et leurs totaux
      if (updatedData.archived !== undefined) {
        if (updatedData.archived) {
          setArchiveUsers((prev) => [...prev, { id: userId, ...updatedData }]);
          setTotalArchiveUsers((prev) => prev + 1);
          setUserState((prev) => prev.filter((user) => user.id !== userId));
          setTotalUsers((prev) => prev - 1);
        } else {
          setUserState((prev) => [...prev, { id: userId, ...updatedData }]);
          setTotalUsers((prev) => prev + 1);
          setArchiveUsers((prev) => prev.filter((user) => user.id !== userId));
          setTotalArchiveUsers((prev) => prev - 1);
        }
      }

      // Mettre à jour les utilisateurs avec le statut "Non Vérifiée"
      if (updatedData.status !== undefined) {
        if (updatedData.status === "Non Vérifiée") {
          setStatusNonVerifieeUsers((prev) => [...prev, { id: userId, ...updatedData }]);
          setTotalStatusNonVerifieeUsers((prev) => prev + 1);
        } else {
          setStatusNonVerifieeUsers((prev) => prev.filter((user) => user.id !== userId));
          setTotalStatusNonVerifieeUsers((prev) => prev - 1);
        }
      }

      setSuccessMessage("Mise à jour réussie !"); // Afficher un message de succès
      setUpdatedUserId(userId); // Mettre à jour l'ID de l'utilisateur mis à jour

    } catch (error) {
      console.error("Erreur lors de la mise à jour du document ! :", error);
      setErrorMessage("Erreur lors de la mise à jour."); // Afficher un message d'erreur
      setErrorUserId(userId); // Mettre à jour l'ID de l'utilisateur qui a rencontré une erreur
    } finally {
      setLoading(false); // Désactiver le chargement
    }
  };

  // Fonction pour afficher ou cacher les détails de l'utilisateur
  const toggleUserDetails = (index: number) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Fonction pour afficher ou cacher la section "devis"
  const toggleDevisDetails = (index: number) => {
    setExpandedDevis((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };




  // Fonction pour afficher les clés et valeurs dans l'ordre spécifié
  const renderObject = (obj: any, parentKey: string = '', index: number) => {
    const keys = Object.keys(obj).sort((a, b) => {
      // Ajoutez ici votre logique de tri si nécessaire
      return a.localeCompare(b);
    });
  
    return keys.map((key) => {
      const value = obj[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
  
      if (value === undefined) {
        return null; // Ne pas afficher les valeurs "undefined"
      }
  
      if (key === 'devis') {
        return (
          <li key={fullKey}>
            <strong>{key}:</strong>
            <button onClick={() => toggleDevisDetails(index)}>
              {expandedDevis[index] ? '-' : '+'}
            </button>
            {expandedDevis[index] && (
              <ul>{renderObject(value, fullKey, index)}</ul>
            )}
          </li>
        );
      }
  
      if (typeof value === 'object' && value !== null) {
        return (
          <li key={fullKey}>
            <strong>{key}:</strong>
            <ul>{renderObject(value, fullKey, index)}</ul>
          </li>
        );
      }
  
      return (
        <li key={fullKey}>
          <strong>{key}:</strong> {fullKey.includes('date') ? formatFirebaseTimestamp(value) : String(value)}
        </li>
      );
    });
  };

  // Fonction pour afficher les utilisateurs par adresse e-mail

  const renderUsersByEmail = (users: any[], collectionName: string) => {
    return users.map((user, index) => (
      <li key={index} className="user-item">
        <div className="user-header">
          <div className="user-header">
            {/* Action pour afficher les détails de l'utilisateur */}
            <div className="action" onClick={() => toggleUserDetails(index)}>
              <img src="/view.svg" alt="View Details" />
            </div>
  
            {/* Lien pour envoyer un e-mail à l'utilisateur */}
            <a
              href={`mailto:${user.email || ''}`}
              className="user-email"
              onClick={(e) => e.stopPropagation()}
            >
              {user.email || 'Email non disponible'}
            </a>
  
            {/* Message de succès si la mise à jour de l'utilisateur a réussi */}
            {updatedUserId === user.id && (
              <div className="success-message">
                Mise à jour réussie !
              </div>
            )}
  
            {/* Message d'erreur si la mise à jour de l'utilisateur a échoué */}
            {errorUserId === user.id && (
              <div className="error-message">
                Erreur lors de la mise à jour.
              </div>
            )}
          </div>
        </div>
  
        {/* Afficher les détails de l'utilisateur si l'utilisateur est étendu */}
        {expandedUsers[index] && (
          <ul className="user-details expanded">
            {/* Afficher les propriétés de l'utilisateur */}
            {renderObject(user, '', index)}
  
            {/* Afficher les options "Archived" et "Standby" si la collection n'est pas 'adresse', 'history' ou 'demandes' */}
            {collectionName !== 'adresse' && collectionName !== 'history' && collectionName !== 'demandes' && (
              <>
                <li className="select-container">
                  <label htmlFor={`archived-${index}`}>Archived:</label>
                  <select
                    id={`archived-${index}`}
                    value={user.archived ? "true" : "false"}
                    onChange={(e) => updateUserState(user.id, { archived: e.target.value === "true" })}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </li>
                <li className="select-container">
                  <label htmlFor={`standby-${index}`}>Standby:</label>
                  <select
                    id={`standby-${index}`}
                    value={user.standby ? "true" : "false"}
                    onChange={(e) => updateUserState(user.id, { standby: e.target.value === "true" })}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </li>
              </>
            )}
  
            {/* Affichage des devis à la fin */}
            {user.devis && (
              <li>
                <strong>Devis:</strong>
                <ul>
                  {user.devis.map((devisItem: any, devisIndex: number) => (
                    <li key={devisIndex}>{devisItem.name}</li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        )}
      </li>
    ));
  };



  return (
    <>
      <div className="home">
        <h1 className="page-title">{title}</h1>
        <FullLengthBox totalUsers={totalUsers} />
  
        <div className="fullLengthBox">
          <button className="hoverEffect" onClick={() => { setSelectedCollection(users); setSelectedTitle('Users'); }}>Users<span className="total-users">{totalUsers ? `(${totalUsers})` : ''}</span></button>
          <button className="hoverEffect" onClick={() => { setSelectedCollection(statusNonVerifieeUsers); setSelectedTitle('Status Non Vérifiée'); }}>Status Non Vérifiée<span className="total-users">{totalStatusNonVerifieeUsers ? `(${totalStatusNonVerifieeUsers})` : ''}</span></button>
          <button className="hoverEffect" onClick={() => { setSelectedCollection(devis); setSelectedTitle('Devis'); }}>Devis<span className="total-users">{totalDevis ? `(${totalDevis})` : ''}</span></button>
          <button className="hoverEffect" onClick={() => { setSelectedCollection(demandes); setSelectedTitle('Demandes'); }}>Demandes<span className="total-users">{totalDemandes ? `(${totalDemandes})` : ''}</span></button>
          <button className="hoverEffect" onClick={() => { setSelectedCollection(adresse); setSelectedTitle('Adresse'); }}>Adresse<span className="total-users">{totalAdresses ? `(${totalAdresses})` : ''}</span></button>
          <button className="hoverEffect" onClick={() => { setSelectedCollection(archiveUsers); setSelectedTitle('Archive Users'); }}>Archive Users<span className="total-users">{totalArchiveUsers ? `(${totalArchiveUsers})` : ''}</span></button>
          <button className="hoverEffect" onClick={() => { setSelectedCollection(history); setSelectedTitle('History'); }}>History</button>
        </div>
      </div>
  
      <div className="user-sections">
        <div className="user-section">
          <h2 className={selectedTitle === 'Status Non Vérifiée' ? 'collectionTitleOrange' : 'collectionTitle'}>
            Collection Sélectionnée : {selectedTitle} - {selectedCollection.length ? `${selectedCollection.length}` : ''}
          </h2>
  
          {loading && <div className="loader">Chargement...</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <ul>
            {selectedTitle === 'Devis' ? (
              selectedCollection.map((devisItem, index) => (
                <li key={devisItem.id} className="user-item">
                  <div className="user-header">
                    <div className="user-header">
                      <div className="action" onClick={() => toggleDevisDetails(index)}>
                        <img src="/view.svg" alt="View Details" />
                      </div>
                      <span className="user-email">{devisItem.email || 'Email non disponible'}</span>
                    </div>
                  </div>
                  {expandedDevis[index] && (
                    <ul className="user-details expanded">
                      {renderObject(devisItem, '', index)}
                    </ul>
                  )}
                </li>
              ))
            ) : (
              renderUsersByEmail(selectedCollection, selectedTitle.toLowerCase())
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default UsersHome;
