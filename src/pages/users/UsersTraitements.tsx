import { useLocation, useNavigate } from 'react-router-dom';
import { GridColDef } from "@mui/x-data-grid";
import Modal from 'react-modal';
import DataTable from "../../components/dataTable/DataTable";
import { useEffect, useState } from "react";
import Add from "../../components/add/Add";
import { getData, getAllUsers, getIncompleteUsers, getNCUsers, AfficheImg } from "../../config/firebase";
import FullLengthBox from "./FullLengthBox";
import "../home/home.scss";
import moment from 'moment';

// Initialiser react-modal
Modal.setAppElement('#root');

const dateCréation = (firebaseTimestamp) => {
  moment.locale('fr');
  const milliseconds = firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1000000;
  const date = new Date(milliseconds);
  return moment(date).format('DD MMMM YYYY');
};

const UsersTraitements = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [documentVerification, setDocumentVerification] = useState({});
  const [activeUserType, setActiveUserType] = useState('all');

  const [identityDocumentUrl, setIdentityDocumentUrl] = useState('');
  const [taxNoticeUrl, setTaxNoticeUrl] = useState('');
  const [documentVerified, setDocumentVerified] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [identityDocumentNC, setIdentityDocumentNC] = useState(false);
  const [taxNoticeNC, setTaxNoticeNC] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleIncompleteUsersClick = async () => {
    const incompleteUsers = await getIncompleteUsers();
    setUser(incompleteUsers);
    setActiveUserType('incomplete');
  };

  const handleNCUsersClick = async () => {
    const ncUsers = await getNCUsers();
    setUser(ncUsers);
    setActiveUserType('nc');
  };

  const handleAllUsersClick = async () => {
    const allUsers = await getAllUsers();
    setUser(allUsers);
    setTotalUsers(allUsers.length);
    setActiveUserType('all');
  };

  useEffect(() => {
    const userFetchFunction = async () => {
      const userFetch = await getData();
      setUser(userFetch);
      setTotalUsers(userFetch.length);
    };
    userFetchFunction();
  }, []);

  const columns: GridColDef[] = [
    { 
      field: "id", 
      headerName: "ID", 
      width: 15,
      renderCell: (params) => (
        <div onClick={() => {
          setSelectedUserId(params.value);
          setIsModalOpen(true);
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
        return (
          <>
            <button style={{ marginRight: '5px' }} onClick={() => {
              /*window.open(params.row.identityDocumentUrl, '_blank', 'height=600,width=800');*/
              AfficheImg(params.row.id , 'ci0.png');
            }}>Voir</button>
            <input type="checkbox" checked={documentVerification[params.row.id]?.identityDocumentVerified} onChange={(e) => {
              setDocumentVerification({
                ...documentVerification,
                [params.row.id]: {
                  ...documentVerification[params.row.id],
                  identityDocumentVerified: e.target.checked,
                  identityDocumentNC: !e.target.checked
                }
              });
            }} />
            <input type="checkbox" style={{ marginLeft: '5px', color: 'red' }} checked={documentVerification[params.row.id]?.identityDocumentNC} onChange={(e) => {
              setDocumentVerification({
                ...documentVerification,
                [params.row.id]: {
                  ...documentVerification,
                  identityDocumentNC: e.target.checked,
                  identityDocumentVerified: !e.target.checked
                }
              });
            }} /> <span className="nc-circle">NC</span>
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
        return (
          <>
          <button
            style={{ marginRight: '5px' }}
            onClick={() => {
              AfficheImg(params.row.id , 'impot0.png');
            }}
          >
            Open Tax Notice
          </button>
          <input
            type="checkbox"
            checked={documentVerification[params.row.id]?.taxNoticeVerified}
            onChange={(e) => {
              setDocumentVerification({
                ...documentVerification,
                [params.row.id]: {
                  ...documentVerification[params.row.id],
                  taxNoticeVerified: e.target.checked,
                  taxNoticeNC: !e.target.checked
                }
              });
            }}
          />
          <input
            type="checkbox"
            style={{ marginLeft: '5px', color: 'red' }}
            checked={documentVerification[params.row.id]?.taxNoticeNC}
            onChange={(e) => {
              setDocumentVerification({
                ...documentVerification,
                [params.row.id]: {
                  ...documentVerification[params.row.id],
                  taxNoticeNC: e.target.checked,
                  taxNoticeVerified: !e.target.checked
                }
              });
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
        return params.value ? 'green' : 'red';
      }
    },
  ];

  return (
    <div className="home">
      <h1 className="page-title">{title}</h1>
      <p>Nombre total d'utilisateurs : <span className="total-users">{totalUsers}</span></p>
      
      <FullLengthBox totalUsers={totalUsers} />

      <div className={`info ${isActive ? 'active' : ''}`}>
        <button className={activeUserType === 'all' ? 'active' : ''} onClick={handleAllUsersClick}>
          ALL USERS <span className="total-users">{`(${totalUsers})`}</span>
        </button>
        <button className={activeUserType === 'incomplete' ? 'active' : ''} onClick={handleIncompleteUsersClick}>USERS Incomplets</button>
        <button className={activeUserType === 'nc' ? 'active' : ''} onClick={handleNCUsersClick}>USERS NC</button>
        <button className={activeUserType === 'usersarchive' ? 'active' : ''} onClick={handleNCUsersClick}>USERS ARCHIVES</button>

        <button onClick={() => setOpen(true)}>Add New User</button>
        
        {user && <DataTable slug="users" columns={columns} rows={user} />}
        
        {open && <Add slug="user" columns={columns} setOpen={setOpen} />}
      </div>
    </div>
  );
};

export default UsersTraitements;
