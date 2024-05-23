// 
//Importation des dépendances nécessaires
import { GridColDef } from "@mui/x-data-grid";
import Modal from 'react-modal';
import DataTable from "../../components/dataTable/DataTable";

import { useEffect, useState } from "react";
import Add from "../../components/add/Add";
import { userRows } from "../../data";
import DocValidnModal from "../../components/DocValidnModal/DocValidnModal";
import {getData} from "../../config/firebase";
import { getIncompleteUsers, getNCUsers, getAllUsers } from "../../config/firebase";
import FullLengthBox from "../../pages/users/FullLengthBox";
import "../home/home.scss";
import "./Parains.scss";



const Users = () => {
  // Déclaration des états
  const [open, setOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [identityDocumentUrl, setIdentityDocumentUrl] = useState('');
  const [taxNoticeUrl, setTaxNoticeUrl] = useState('');
  const [documentVerified, setDocumentVerified] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [identityDocumentNC, setIdentityDocumentNC] = useState(false);
  const [taxNoticeNC, setTaxNoticeNC] = useState(false);
  const [documentVerification, setDocumentVerification] = useState({});
  const [user,setuser] = useState(null);
  // POUR LES BOUTONS 
  const handleIncompleteUsersClick = async () => {
    const incompleteUsers = await getIncompleteUsers();
    setuser(incompleteUsers);
  };
  const handleNCUsersClick = async () => {
    const ncUsers = await getNCUsers();
    setuser(ncUsers);
  };
  const handleAllUsersClick = async () => {
    const allUsers = await getAllUsers();
    setuser(allUsers);
  };
  

  
  useEffect( () => {
    const userfetchfonction = async () => {
      const userfetch = await getData();
      setuser(userfetch);

    }
    userfetchfonction( );
  } , []);


  console.log(user);

  const columns: GridColDef[] = [
   
    { 
      field: "id", 
      headerName: "ID", 
      width: 40,
      renderCell: (params) => (
        <div onClick={() => history.push(`/users/${params.value}`)}>
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
      headerName: "Created At",
      width: 110,
      type: "date",
      valueGetter: (params) => {
        if (params.row.dateCreation && params.row.dateCreation instanceof Date) {
          return params.row.dateCreation.toDate();
        }
        return null;
      },
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
          window.open(params.row.identityDocumentUrl, '_blank', 'height=600,width=800');
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
              ...documentVerification[params.row.id],
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
            <button style={{ marginRight: '5px' }} onClick={() => {
              window.open(params.row.taxNoticeUrl, '_blank', 'height=600,width=800');
            }}>Voir</button>
            
            <input type="checkbox" checked={documentVerification[params.row.id]?.taxNoticeVerified} onChange={(e) => {
              setDocumentVerification({
                ...documentVerification,
                [params.row.id]: {
                  ...documentVerification[params.row.id],
                  taxNoticeVerified: e.target.checked,
                  taxNoticeNC: !e.target.checked
                }
              });
            }} /> 
            <input type="checkbox" style={{ marginLeft: '5px', color: 'red' }} checked={documentVerification[params.row.id]?.taxNoticeNC} onChange={(e) => {
              setDocumentVerification({
                ...documentVerification,
                [params.row.id]: {
                  ...documentVerification[params.row.id],
                  taxNoticeNC: e.target.checked,
                  taxNoticeVerified: !e.target.checked
                }
              });
            }} /> <span className="nc-circle">NC</span>
          </>
        );
      },
    },
    {
      field: "Vérifiée",
      headerName: "Vérifiée",
      width: 100,
      type: "boolean",
      valueGetter: (params) => {
        return documentVerification[params.row.id]?.identityDocumentVerified && documentVerification[params.row.id]?.taxNoticeVerified;
      },
      cellClassName: (params) => {
        return params.value ? 'green' : 'red';
      }
    },
  ];

  // Rendu du composant
  return (
    <div className="users">
      <FullLengthBox /> {/* Ajout du composant ici */}   
      <div className="info">
       
        <h1>Users</h1>
        <button onClick={() => {
          setOpen(true);
        }}>Add New User</button>
        <button onClick={handleIncompleteUsersClick}>Utilisateurs incomplets</button>
        <button onClick={handleNCUsersClick}>Utilisateurs NC</button>
        <button onClick={handleAllUsersClick}>ALL USERS</button>
      </div>
      {user && <DataTable slug="users" columns={columns} rows={user} />}
      {open && <Add slug="user" columns={columns} setOpen={setOpen} />}
    </div>
  );
};

export default Users;