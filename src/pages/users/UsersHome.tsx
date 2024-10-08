import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getData, getTotalUsers } from "../../config/firebase";
import { collection, getDocs, getFirestore, setDoc, deleteDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import { app } from "../../config/firebase";
import './FullLengthBox.scss';
import './UsersHome.scss';

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

const UsersHome: React.FC<UsersHomeProps> = ({ title }) => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [adresse, setAdresse] = useState<any[]>([]);
  const [archiveUsers, setArchiveUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [users, setUserState] = useState<any[]>([]);
  const [statusNonVerifieeUsers, setStatusNonVerifieeUsers] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [expandedUsers, setExpandedUsers] = useState<{ [key: string]: boolean }>({});
  const [expandedDevis, setExpandedDevis] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatedUserId, setUpdatedUserId] = useState<string | null>(null);
  const [errorUserId, setErrorUserId] = useState<string | null>(null);
  const [totalArchiveUsers, setTotalArchiveUsers] = useState<number>(0);
  const [totalAdresses, setTotalAdresses] = useState<number>(0);
  const [totalStatusNonVerifieeUsers, setTotalStatusNonVerifieeUsers] = useState<number>(0);
  const [totalDevis, setTotalDevis] = useState<number>(0);
  const [devis, setDevis] = useState<any[]>([]);




  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getData();
      const totalUsersCount = await getTotalUsers();
      setUserState(usersData);
      setTotalUsers(totalUsersCount);

      const statusNonVerifiee = usersData.filter((user: any) => user.status === "Non Vérifiée");
      setStatusNonVerifieeUsers(statusNonVerifiee);
      setTotalStatusNonVerifieeUsers(statusNonVerifiee.length);

      const allDevis = usersData.flatMap((user: any) => user.additionalData?.devis || []);
      setDevis(allDevis);
      setTotalDevis(allDevis.length);
    };
    fetchData();
  }, []);




  useEffect(() => {

    const fetchCollection = async (collectionName: string, setState: React.Dispatch<React.SetStateAction<any[]>>) => {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const dataList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setState(dataList);

        if (collectionName === 'adresse') {
          setTotalAdresses(querySnapshot.size);
          fetchEmailsForAddresses(dataList); // Appeler la fonction pour récupérer les e-mails
        } else if (collectionName === 'archiveUsers') {
          setTotalArchiveUsers(querySnapshot.size);
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération de la collection ${collectionName}:`, error);
      }
    };

    // RECUP ADRESSES MAILS VIA ID
    const fetchEmailsForAddresses = async (addresses: any[]) => {
      // Utiliser Promise.all pour traiter toutes les adresses en parallèle
      const updatedAddresses = await Promise.all(
        addresses.map(async (address) => {
          // Récupérer le document utilisateur correspondant à l'adresse
          const userDoc = await getDoc(doc(db, 'users', address.id));
          if (userDoc.exists()) {
            // Si le document utilisateur existe, ajouter l'adresse e-mail à l'objet adresse
            return { ...address, email: userDoc.data().email };
          }
          // Si le document utilisateur n'existe pas, retourner l'adresse sans modification
          return address;
        })
      );
      // Mettre à jour l'état adresse avec les adresses enrichies des e-mails récupérés
      setAdresse(updatedAddresses);
    };


    fetchCollection('adresse', setAdresse); //useEffect appelle fetchCollection pour récupérer les adresses et les e-mails associés.
    fetchCollection('archiveUsers', setArchiveUsers);
    fetchCollection('history', setHistory);
  }, []);



  const updateUserState = async (userId: string, updatedData: Partial<{ archived: boolean; standby: boolean; status: string }>) => {
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setUpdatedUserId(null);
    setErrorUserId(null);

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, updatedData);

      if (updatedData.archived !== undefined) {
        await updateUserArchiveStatus(userId, updatedData.archived);
      }

      setUserState((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user.id === userId ? { ...user, ...updatedData } : user
        );
        return updatedUsers;
      });

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

      if (updatedData.status !== undefined) {
        if (updatedData.status === "Non Vérifiée") {
          setStatusNonVerifieeUsers((prev) => [...prev, { id: userId, ...updatedData }]);
          setTotalStatusNonVerifieeUsers((prev) => prev + 1);
        } else {
          setStatusNonVerifieeUsers((prev) => prev.filter((user) => user.id !== userId));
          setTotalStatusNonVerifieeUsers((prev) => prev - 1);
        }
      }

      setSuccessMessage("Mise à jour réussie !");
      setUpdatedUserId(userId);
    } catch (error) {
      setErrorMessage("Erreur lors de la mise à jour.");
      setErrorUserId(userId);
    } finally {
      setLoading(false);
    }
  };

  const updateUserArchiveStatus = async (userId: string, isArchived: boolean) => {
    try {
      if (isArchived) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          await setDoc(doc(db, 'archiveUsers', userId), userDoc.data());
          await updateDoc(doc(db, 'users', userId), { archived: true });
        }
      } else {
        const archivedUserDoc = await getDoc(doc(db, 'archiveUsers', userId));
        if (archivedUserDoc.exists()) {
          await setDoc(doc(db, 'users', userId), archivedUserDoc.data());
          await updateDoc(doc(db, 'users', userId), { archived: false });
          await deleteDoc(doc(db, 'archiveUsers', userId));
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état d'archivage :", error);
    }
  };

  const toggleUserDetails = (index: number) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleDevisDetails = (index: number) => {
    setExpandedDevis((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderObject = (obj: any, parentKey: string = '', index: number) => {
    const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));

    return keys.map((key) => {
      const value = obj[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (value === undefined) {
        return null;
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
        </ul>
      )}
    </li>
  ));
};

  const filterUserDevis = (users: any[]) => { // filtre pour affichage de devis
    return users.map(user => ({
      email: user.email,
      status: user.status,
      id: user.id,
      civilite: user.civilite,
      lastname: user.lastname,
      firstname: user.firstname,
      phone: user.phone,
      adresse: user.adresse,
      ville: user.ville,
      region: user.region,
      devis: user.additionalData?.devis,
    }));
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


          {selectedTitle !== 'Devis' && renderUsersByEmail(selectedCollection, selectedTitle.toLowerCase())}
          {selectedTitle === 'Devis' && renderUsersByEmail(filterUserDevis(users), 'devis')}
        </div>
      </div>
    </>
  );
};

export default UsersHome;