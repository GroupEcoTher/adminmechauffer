import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridToolbar, GridSortModel } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { Checkbox, Button } from "@mui/material";
import { doc, getDoc, setDoc, updateDoc, addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import "./dataTable.scss";

type Props = {
  columns: GridColDef[];
  rows: readonly { id: number; archived: boolean; standby: boolean; verified: boolean; }[];
  slug: string;
};

const DataTable = (props: Props) => {
  const [rows, setRows] = useState(props.rows);
  const [archivedRows, setArchivedRows] = useState([]); // Ajout de l'état pour stocker les utilisateurs archivés

  useEffect(() => {
    setRows(props.rows);
    fetchArchivedUsers(); // Appel de la fonction pour récupérer les utilisateurs archivés au montage
  }, [props.rows]);

  // Fonction pour sauvegarder l'historique des mouvements
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

  // Fonction pour archiver l'utilisateur sans le supprimer
  const handleDelete = async (id: number) => {
    try {
      // Référence au document de l'utilisateur
      const userDocRef = doc(db, "users", id.toString());
      const userDocSnap = await getDoc(userDocRef);
  
      // Vérifie si le document existe
      if (userDocSnap.exists()) {
        // Met à jour le champ 'archived' à true
        await updateDoc(userDocRef, { archived: true });
  
        console.log(`Archived item with id: ${id} successfully.`);
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, archived: true } : row
          )
        );
  
        // Enregistre l'historique
        await saveHistory(id, "archive", `User with id ${id} archived`);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error archiving document: ", error);
    }
  };
  

  // Fonction pour désarchiver l'utilisateur
  const handleUnarchive = async (id: number) => {
    try {
      // Référence au document de l'utilisateur
      const userDocRef = doc(db, "users", id.toString());
      const userDocSnap = await getDoc(userDocRef);
  
      // Vérifie si le document existe
      if (userDocSnap.exists()) {
        // Met à jour le champ 'archived' à false
        await updateDoc(userDocRef, { archived: false });
  
        console.log(`Unarchived item with id: ${id} successfully.`);
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, archived: false } : row
          )
        );
  
        // Enregistre l'historique
        await saveHistory(id, "unarchive", `User with id ${id} unarchived`);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error unarchiving document: ", error);
    }
  };

  // FONCTION pour récupérer les utilisateurs archivés
  const fetchArchivedUsers = async () => {
    try {
      // Requête pour récupérer les utilisateurs archivés
      const querySnapshot = await getDocs(query(collection(db, "users"), where("archived", "==", true)));
      
      const archivedUsers = [];
      querySnapshot.forEach((doc) => {
        archivedUsers.push({ id: doc.id, ...doc.data() });
      });
  
      // Met à jour l'état avec les utilisateurs archivés
      setArchivedRows(archivedUsers);
  
      console.log("Fetched archived users successfully.");
    } catch (error) {
      console.error("Error fetching archived users: ", error);
    }
  };

  // Fonction pour marquer un utilisateur comme en attente (StandBY)
  const handleStandBY = async (id: number, standby: boolean) => {
    try {
      const userDocRef = doc(db, "users", id.toString());
      await updateDoc(userDocRef, {
        standby: standby
      });

      console.log(`User with id: ${id} is now ${standby ? 'in StandBY mode' : 'active'}.`);
      setRows((prevRows) => prevRows.map((row) => row.id === id ? { ...row, standby } : row));
      await saveHistory(id, "standby", `User with id ${id} set to ${standby ? 'StandBY' : 'active'}`);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Ajouter une colonne action avec des liens
  const actionColumn: GridColDef = {
    field: "action",
    headerName: "Action",
    width: 100,
    renderCell: (params) => {
      return (
        <div className="action" key={`action-${params.row.id}`}>
          <Link to={`/ModalUsers/${params.row.id}`}>
            <img src="/view.svg" alt="View Details" />
          </Link>
        </div>
      );
    },
  };

  // Ajouter une colonne suspend pour StandBY avec une case à cocher
  const suspendColumn: GridColDef = {
    field: "StandBY",
    headerName: "StandBY",
    width: 100,
    renderCell: (params) => {
      return (
        <div className="StandBY" key={`standby-${params.row.id}`}>
          <Checkbox
            checked={params.row.standby}
            onChange={(e) => handleStandBY(params.row.id, e.target.checked)}
          />
          {params.row.standby && (
            <div style={{ width: 20, height: 20, backgroundColor: 'lightblue', marginLeft: 10 }}></div>
          )}
        </div>
      );
    },
  };

  // Ajouter une colonne suprUser pour l'archivage
  const suprUser: GridColDef = {
    field: "suprUser",
    headerName: "Suppr",
    width: 100,
    renderCell: (params) => {
      return (
        !params.row.archived && (
          <div className="suprUser" key={`delete-${params.row.id}`} onClick={() => handleDelete(params.row.id)}>
            <img src="/delete.svg" alt="Delete" />
          </div>
        )
      );
    },
  };

  // Ajouter une colonne archivée pour indiquer l'archivage et inclure un bouton "Unarchive"
  const archiveColumn: GridColDef = {
    field: "archived",
    headerName: "Archivée",
    width: 120,
    renderCell: (params) => {
      return (
        <div className="archived" key={`archived-${params.row.id}`}>
          {params.row.archived ? (
            <>
              <div style={{ width: 10, height: 10, backgroundColor: 'red', borderRadius: '50%', marginRight: 2 }}></div>
              <Button style={{ width: 100, height: 30, backgroundColor: 'orange', color: 'black' }} onClick={() => handleUnarchive(params.row.id)}>Unarchive</Button>  
            </>
          ) : null}
        </div>
      );
    },
  };

  // Ajouter une colonne pour les utilisateurs archivés
  const archivedUserColumn: GridColDef = {
    field: "archivedUsers",
    headerName: "Archived Users",
    width: 200,
    renderCell: (params) => {
      return (
        <div>
          {archivedRows.map((user) => (
            <div key={user.id}>
              <p>{user.name}</p>
            </div>
          ))}
        </div>
      );
    },
  };

  // Définir un modèle de tri par défaut
  const sortModel: GridSortModel = [
    {
      field: 'dateCreation',
      sort: 'desc',
    },
  ];

  // Définir une fonction de rendu de ligne pour colorer les lignes archivées, standby et vérifiées
  const getRowClassName = (params: { row: { archived: boolean; standby: boolean; verified: boolean; }; }) => {
    if (params.row.archived) return 'archivedRow';
    if (params.row.standby) return 'standbyRow';
    if (params.row.verified) return 'verifiedRow';
    return '';
  };

  return (
    <div className="dataTable">
      <DataGrid
        className="dataGrid"
        rows={rows}
        columns={[...props.columns, actionColumn, suspendColumn, suprUser, archiveColumn, archivedUserColumn]}
        sortModel={sortModel}
        pageSize={20}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        pageSizeOptions={[5, 20]}
        checkboxSelection
        disableRowSelectionOnClick
        disableColumnFilter
        disableDensitySelector
        disableColumnSelector
        getRowClassName={getRowClassName}
      />
    </div>
  );
};

export default DataTable;
