import { useLocation, useNavigate } from 'react-router-dom';
import { GridColDef } from "@mui/x-data-grid";
import Modal from 'react-modal';
import DataTable from "../../components/dataTable/DataTable";
import { useEffect, useState } from "react";
import Add from "../../components/add/Add";
import { getData, getAllUsers, getIncompleteUsers, getNCUsers, AfficheImg, checkAndUpdateVerificationStatus } from "../../config/firebase";
import FullLengthBox from "./FullLengthBox";
import moment from 'moment';

// Initialiser react-modal
Modal.setAppElement('#root');

// Fonction pour sauvegarder l'état de vérification dans le local storage
const saveVerificationStateToLocalStorage = (state: DocumentVerification) => {
  localStorage.setItem('documentVerification', JSON.stringify(state));
};

// Fonction pour charger l'état de vérification depuis le local storage
const loadVerificationStateFromLocalStorage = () => {
  const savedState = localStorage.getItem('documentVerification');
  return savedState ? JSON.parse(savedState) : {};
};

// Définir les types pour documentVerification et documentDisplayed
interface DocumentVerification {
  [key: string]: {
    identityDocumentVerified?: boolean;
    identityDocumentNC?: boolean;
    taxNoticeVerified?: boolean;
    taxNoticeNC?: boolean;
  };
}

interface DocumentDisplayed {
  [key: string]: {
    identityDocumentDisplayed?: boolean;
    taxNoticeDisplayed?: boolean;
  };
}

interface UsersTraitementsProps {
  title: string;
}

const UsersTraitements: React.FC<UsersTraitementsProps> = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [documentVerification, setDocumentVerification] = useState<DocumentVerification>(loadVerificationStateFromLocalStorage());
  const [documentDisplayed, setDocumentDisplayed] = useState<DocumentDisplayed>({});
  const [activeUserType, setActiveUserType] = useState('all');

  // Détermine si le chemin actuel est actif
  const isActive = (path: string) => location.pathname === path;

  // Gestion des utilisateurs incomplets
  const handleIncompleteUsersClick = async () => {
    const incompleteUsers = await getIncompleteUsers();
    setUser(incompleteUsers);
    setActiveUserType('incomplete');
  };

  // Gestion des utilisateurs NC
  const handleNCUsersClick = async () => {
    const ncUsers = await getNCUsers();
    setUser(ncUsers);
    setActiveUserType('nc');
  };


  
  // Gestion de tous les utilisateurs
  const handleAllUsersClick = async () => {
    const allUsers = await getAllUsers();
    setUser(allUsers);
    setTotalUsers(allUsers.length);
    setActiveUserType('all');
  };



  // Vérification et mise à jour du statut de vérification de chaque utilisateur
  const verifyAllUsers = async (users: any[]) => {
    for (let user of users) {
      await checkAndUpdateVerificationStatus(user.id);
    }
  };

  // Chargement des données utilisateur à l'initialisation
  useEffect(() => {
    const userFetchFunction = async () => {
      const userFetch = await getData();
      setUser(userFetch);
      setTotalUsers(userFetch.length);

      // Vérification et mise à jour des statuts de vérification
      await verifyAllUsers(userFetch);
    };
    userFetchFunction();
  }, []);

  // Sauvegarde de l'état de vérification dans le local storage à chaque modification
  useEffect(() => {
    saveVerificationStateToLocalStorage(documentVerification);
  }, [documentVerification]);

  // Fonction pour gérer l'affichage du document et vérifier son existence
  const handleViewDocument = async (userId: string, path: string, documentType: keyof DocumentDisplayed[string]) => {
    const documentExists = await AfficheImg(userId, path);
    if (documentExists) {
      setDocumentDisplayed({
        ...documentDisplayed,
        [userId]: {
          ...documentDisplayed[userId],
          [documentType]: true,
        },
      });
    } else {
      setDocumentDisplayed({
        ...documentDisplayed,
        [userId]: {
          ...documentDisplayed[userId],
          [documentType]: false,
        },
      });
    }
  };

  const columns: GridColDef[] = [
    { 
      field: "id", 
      headerName: "ID", 
      width: 15,
      renderCell: (params) => (
        <div onClick={() => {
          navigate(`/ModalUsers/${params.value}`);
        }}> 
          {params.value}
        </div>
      ),
    },
    {
      field: "firstname",
      type: "string",
      headerName: "First name",
      width: 90,
    },
    {
      field: "lastname",
      type: "string",
      headerName: "Last name",
      width: 110,
    },
    {
      field: "email",
      type: "string",
      headerName: "Email",
      width: 130,
    },
    {
      field: "phone",
      type: "string",
      headerName: "Phone",
      width: 120,
    },
    {
      field: "dateCreation",
      type: "date",
      headerName: "Created At",
      width: 110,
      valueGetter: (params) => {
        const firebaseTimestamp = params.row.dateCreation;
        moment.locale('fr');
        if (firebaseTimestamp?.seconds && firebaseTimestamp?.nanoseconds) {  
          const milliseconds = firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1000000;   
          const date = new Date(milliseconds);
          return date;
        } else {
          return '';
        }
      },
      valueFormatter: (params) => {
        if (params.value) {
          return params.value.toLocaleDateString();
        }
        return "";
      }
    },
    {
      field: "Pièce Identité",
      headerName: "Pièce Identité",
      width: 100,
      type: "string",
      renderCell: (params) => {
        const hasDocument = !!params.row.identityDocumentUrl; // Vérifie si l'URL du document existe
        return (
          <>
            <button
              className={`button-view ${hasDocument ? 'has-document' : ''}`}
              style={{ color: hasDocument ? 'orange' : '' }}
              onClick={() => handleViewDocument(params.row.id, 'ci0.png', 'identityDocumentDisplayed')}
            >
              Voir
            </button>
            <input
              type="checkbox"
              className="checkbox"
              checked={documentVerification[params.row.id]?.identityDocumentVerified || false}
              disabled={!documentDisplayed[params.row.id]?.identityDocumentDisplayed}
              onChange={(e) => {
                if (documentDisplayed[params.row.id]?.identityDocumentDisplayed) {
                  const updatedVerification = {
                    ...documentVerification,
                    [params.row.id]: {
                      ...documentVerification[params.row.id],
                      identityDocumentVerified: e.target.checked,
                      identityDocumentNC: !e.target.checked,
                    },
                  };
                  setDocumentVerification(updatedVerification);
                  saveVerificationStateToLocalStorage(updatedVerification);
                }
              }}
            />
            <input
              type="checkbox"
              className={`checkbox orange`}
              style={{ marginLeft: '1px' }}
              checked={documentVerification[params.row.id]?.identityDocumentNC || false}
              onChange={(e) => {
                if (documentDisplayed[params.row.id]?.identityDocumentDisplayed) {
                  const updatedVerification = {
                    ...documentVerification,
                    [params.row.id]: {
                      ...documentVerification[params.row.id],
                      identityDocumentNC: e.target.checked,
                      identityDocumentVerified: !e.target.checked,
                    },
                  };
                  setDocumentVerification(updatedVerification);
                  saveVerificationStateToLocalStorage(updatedVerification);
                }
              }}
            />
            <span className="nc-circle">NC</span>
          </>
        );
      },
    },
    {
      field: "Avis D'impôts",
      headerName: "Avis D'impôts",
      width: 100,
      type: "string",
      renderCell: (params) => {
        const hasDocument = !!params.row.taxNoticeUrl; // Vérifie si l'URL du document existe
        return (
          <>
            <button
              className={`button-view ${hasDocument ? 'has-document' : ''}`}
              style={{ color: hasDocument ? 'orange' : '' }}
              onClick={() => handleViewDocument(params.row.id, 'impot0.png', 'taxNoticeDisplayed')}
            >
              Voir
            </button>
            <input
              type="checkbox"
              className="checkbox"
              checked={documentVerification[params.row.id]?.taxNoticeVerified || false}
              disabled={!documentDisplayed[params.row.id]?.taxNoticeDisplayed}
              onChange={(e) => {
                if (documentDisplayed[params.row.id]?.taxNoticeDisplayed) {
                  const updatedVerification = {
                    ...documentVerification,
                    [params.row.id]: {
                      ...documentVerification[params.row.id],
                      taxNoticeVerified: e.target.checked,
                      taxNoticeNC: !e.target.checked,
                    },
                  };
                  setDocumentVerification(updatedVerification);
                  saveVerificationStateToLocalStorage(updatedVerification);
                }
              }}
            />
            <input
              type="checkbox"
              className={`checkbox orange`}
              style={{ marginLeft: '1px' }}
              checked={documentVerification[params.row.id]?.taxNoticeNC || false}
              onChange={(e) => {
                if (documentDisplayed[params.row.id]?.taxNoticeDisplayed) {
                  const updatedVerification = {
                    ...documentVerification,
                    [params.row.id]: {
                      ...documentVerification[params.row.id],
                      taxNoticeNC: e.target.checked,
                      taxNoticeVerified: !e.target.checked,
                    },
                  };
                  setDocumentVerification(updatedVerification);
                  saveVerificationStateToLocalStorage(updatedVerification);
                }
              }}
            />
            <span className="nc-circle">NC</span>
          </>
        );
      },
    },
    {
      field: "Vérifiée",
      headerName: "Vérifiée",
      width: 60,
      type: "boolean",
      valueGetter: (params) => {
        return documentVerification[params.row.id]?.identityDocumentVerified && documentVerification[params.row.id]?.taxNoticeVerified;
      },
      cellClassName: (params) => {
        return params.value ? 'green' : '';
      },
      renderCell: (params) => {
        return params.value ? (
          <div className="verified-icon"></div>
        ) : (
          <div></div>
        );
      },
    },
  ];

  return (
    <div className="home">
      <h1 className="page-title">{title}</h1>
      <FullLengthBox totalUsers={totalUsers} />
      <p>Nombre total d'utilisateurs : <span className="total-users">{totalUsers}</span></p>
      <div className={`info ${isActive(location.pathname) ? 'active' : ''}`}>
        <button className={activeUserType === 'all' ? 'active' : ''} onClick={handleAllUsersClick}>
          ALL USERS <span className="total-users">{`(${totalUsers})`}</span>
        </button>
        <button className={activeUserType === 'incomplete' ? 'active' : ''} onClick={handleIncompleteUsersClick}>USERS Incomplets</button>
        <button className={activeUserType === 'nc' ? 'active' : ''} onClick={handleNCUsersClick}>USERS NC</button>
        <button className={activeUserType === 'usersarchive' ? 'active' : ''} onClick={handleNCUsersClick}>USERS ARCHIVES</button>
        <button onClick={() => setOpen(true)}>Add New User</button>
        {user && <DataTable columns={columns} rows={user} title={''} slug={''} />}
        {open && <Add slug="user" columns={columns} setOpen={setOpen} />}
      </div>
    </div>
  );
};

export default UsersTraitements;