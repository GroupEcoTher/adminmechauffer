import { GridColDef } from "@mui/x-data-grid";
import DataTable from "../../components/dataTable/DataTable";
import "./Users.scss";
import { useState } from "react";
import Add from "../../components/add/Add";
import { userRows } from "../../data";

import DocValidnModal from "../../components/DocValidnModal/DocValidnModal"; // Corrigez le chemin d'importation ici

// import { useQuery } from "@tanstack/react-query";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 40 },
  {
    field: "img",
    headerName: "Avatar",
    width: 40,
    renderCell: (params) => {
      return <img src={params.row.img || "/noavatar.png"} alt="" />;
    },
  },
  {
    field: "firstName",
    type: "string",
    headerName: "First name",
    width: 90,
  },
  {
    field: "lastName",
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
    field: "createdAt",
    headerName: "Created At",
    width: 110,
    type: "string",
  },
  {
    field: "Pièce Identité",
    headerName: "Pièce Identité",
    width: 100,
    type: "string",
    renderCell: (params) => {
      return <button onClick={() => {
        setSomeDocumentUrl(params.row.identityDocumentUrl);
        setModalIsOpen(true);
      }}>Voir</button>;
    },
  },
  {
    field: "Avis D'impôts",
    headerName: "Avis D'impôts",
    width: 100,
    type: "string",
    renderCell: (params) => {
      return <button onClick={() => {
        setSomeDocumentUrl(params.row.taxNoticeUrl);
        setModalIsOpen(true);
      }}>Voir</button>;
    },
  },
  {
    field: "verified",
    headerName: "Verified",
    width: 75,
    type: "boolean",
  },
];
const Users = () => {
  const [open, setOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const someDocumentUrl = "http://example.com"; // Définissez une URL par défaut ici

  // TEST THE API

  // const { isLoading, data } = useQuery({
  //   queryKey: ["allusers"],
  //   queryFn: () =>
  //     fetch("http://localhost:8800/api/users").then(
  //       (res) => res.json()
  //     ),
  // });

  return (
    <div className="users">
      <div className="info">
        <h1>Users</h1>
        <button onClick={() => {
          setOpen(true);
          setModalIsOpen(true); // Ouvrez le modal quand le bouton est cliqué
        }}>Add New User</button>
      </div>
      <DataTable slug="users" columns={columns} rows={userRows} />
      {open && <Add slug="user" columns={columns} setOpen={setOpen} />}
      <DocValidnModal documentUrl={someDocumentUrl} modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} />
    </div>
  );
};
export default Users;
