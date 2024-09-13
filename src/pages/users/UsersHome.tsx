import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
//import ChartBox from "../../components/chartBox/ChartBox";
//import BarChartBox from "../../components/barChartBox/BarChartBox";
import { getData, getTotalUsers } from "../../config/firebase";
//import {barChartBoxRevenue,barChartBoxVisit,chartBoxConversion,chartBoxProduct,chartBoxRevenue,chartBoxUser,} from "../../data";

//import { ChartBoxProps, BarChartBoxProps } from "../../components/types/types";
import { collection, getDocs, getFirestore, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { app } from "../../config/firebase";
import './FullLengthBox.scss';
import './UsersHome.scss';

import { doc, updateDoc } from "firebase/firestore";

const db = getFirestore(app);

// Interface pour ChartBoxProps avec un champ "number"
//interface ChartBoxPropsWithNumber extends ChartBoxProps {
//  number: string;}

//const chartBoxData: ChartBoxPropsWithNumber[] = [chartBoxUser, chartBoxProduct, chartBoxConversion, chartBoxRevenue];
//const barChartBoxData: BarChartBoxProps[] = [barChartBoxVisit, barChartBoxRevenue];

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
  //const [setUserActions] = useState<any[]>([]);
  //const [userActions] = useState<any[]>([]);
  const [users, setUserState] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<{ [key: string]: boolean }>({});

  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  

 // Définir des états pour le total de chaque collection
  const [totalArchiveUsers, setTotalArchiveUsers] = useState<number>(0);
  const [totalAdresses, setTotalAdresses] = useState<number>(0);
  const [totalDemandes, setTotalDemandes] = useState<number>(0);


  // Fetch des données Firestore pour "users" et "totalUsers"
  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getData();
      const totalUsersCount = await getTotalUsers();
      setUserState(usersData);
      setTotalUsers(totalUsersCount);
    };

    fetchData();
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
  }, []);
  



 // Fonction pour mettre à jour l'état de l'utilisateur dans Firestore
const updateUserState = async (userId: string, updatedData: Partial<{ archived: boolean; standby: boolean }>) => {
  setLoading(true); // Activer le chargement
  setSuccessMessage(null);
  setErrorMessage(null);

  try {
    const userRef = doc(db, "archiveUsers", userId); // Référence au document dans archiveUsers
    await updateDoc(userRef, updatedData);  // Mise à jour dans archiveUsers

    if (updatedData.archived === false) {
      // Déplacer l'utilisateur vers la collection 'users' si non archivé
      const userData = (await getDoc(userRef)).data();  // Récupère les données utilisateur
      await setDoc(doc(db, "users", userId), userData);  // Ajoute l'utilisateur à la collection 'users'
      await deleteDoc(userRef);  // Supprime l'utilisateur de 'archiveUsers'
    }

    setSuccessMessage("Mise à jour réussie !"); // Afficher un message de succès
    
    // Rafraîchir les collections après mise à jour
    fetchCollections();

  } catch (error) {
    console.error("Erreur lors de la mise à jour du document:", error);
    setErrorMessage("Erreur lors de la mise à jour."); // Afficher un message d'erreur
  } finally {
    setLoading(false); // Désactiver le chargement
  }
};

// Fonction pour récupérer toutes les collections
const fetchCollections = async () => {
  try {
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
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération de la collection ${collectionName}:`, error);
      }
    };
    
    // Appeler la fonction pour chaque collection
    await fetchCollection('adresse', setAdresse);
    await fetchCollection('archiveUsers', setArchiveUsers);
    await fetchCollection('demandes', setDemandes);
    await fetchCollection('history', setHistory);
  } catch (error) {
    console.error("Erreur lors de la récupération des collections:", error);
  }
};

  
  

  
  // Fonction pour afficher ou cacher les détails de l'utilisateur
  const toggleUserDetails = (index: number) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Fonction pour afficher les utilisateurs par adresse e-mail
  const renderUsersByEmail = (users: any[]) => {
    return users.map((user, index) => (
      <li key={index}>
        <div className="user-header">
          <div className="user-header">
            <div className="action" onClick={() => toggleUserDetails(index)}>
              {/* Modification de l'image */}
              <img src="/view.svg" alt="View Details" />
            </div>
            <a
              href={`mailto:${user.email || ''}`}
              className="user-email"
              onClick={(e) => e.stopPropagation()} // Évite le toggle du détail au clic sur l'email
            >
              {user.email || 'Email non disponible'}
            </a>
          </div>  

          
            <div className="actions">
              {/* Menu pour modifier l'état archived */}
              <label htmlFor={`archived-${index}`}>Archived:</label>
              <select
                id={`archived-${index}`}
                value={user.archived ? "true" : "false"}
                onChange={(e) => updateUserState(user.id, { archived: e.target.value === "true" })}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>

              {/* Menu pour modifier l'état standby */}
              <label htmlFor={`standby-${index}`}>Standby:</label>
              <select
                id={`standby-${index}`}
                value={user.standby ? "true" : "false"}
                onChange={(e) => updateUserState(user.id, { standby: e.target.value === "true" })}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>


        {expandedUsers[index] && (
          <ul>
            {Object.entries(user).map(([key, value]) => (
              key !== 'email' && (
                <li key={key}>
                  <strong>{key}:</strong> {String(value)}
                </li>
              )
            ))}
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
        {/* Boutons pour afficher les différentes collections */}
        <button className="hoverEffect" onClick={() => setSelectedCollection(users)}>Users<span className="total-users">{totalUsers ? `(${totalUsers})` : ''}</span>
        </button>
        <button className="hoverEffect" onClick={() => setSelectedCollection(archiveUsers)}>Archive Users<span className="total-users">{totalArchiveUsers ? `(${totalArchiveUsers})` : ''}</span>
        </button>
        <button className="hoverEffect" onClick={() => setSelectedCollection(adresse)}> Adresse<span className="total-users">{totalAdresses ? `(${totalAdresses})` : ''}</span>
        </button>
        <button className="hoverEffect" onClick={() => setSelectedCollection(demandes)}>Demandes<span className="total-users">{totalDemandes ? `(${totalDemandes})` : ''}</span>
        </button>
        <button className="hoverEffect" onClick={() => setSelectedCollection(history)}>History</button>
        {/*<button className="hoverEffect" onClick={() => setSelectedCollection(userActions)}>User Actions</button>*/}
        
      </div>
    </div>


      
      {/* Affichage de la collection sélectionnée par adresse e-mail */}
      <div>
        <h2>Collection Sélectionnée :         {loading && <div className="loader">Chargement...</div>} {/* Loader */}
        {successMessage && <div className="success-message">{successMessage}</div>} {/* Message de succès */}
        {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Message erreur */}
</h2>
        <ul>
          {renderUsersByEmail(selectedCollection)} 
        </ul>
      </div>

    
    </>
  );
};

export default UsersHome;