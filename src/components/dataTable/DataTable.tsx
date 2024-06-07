import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridToolbar, GridSortModel } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { Checkbox, Button } from "@mui/material";
import { doc, getDoc, setDoc, deleteDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../config/firebase"; // Assure-toi que le chemin est correct pour ton fichier de configuration Firebase
import "./dataTable.scss";

type Props = {
  columns: GridColDef[];
  rows: readonly { archived: any; standby: any; verified: any; }[];
  slug: string;
};

const DataTable = (props: Props) => {
  const [rows, setRows] = useState(props.rows);

  useEffect(() => {
    setRows(props.rows);
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

  // Fonction pour archiver et supprimer l'utilisateur
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
        setRows(rows.map((row) => row.id === id ? { ...row, archived: true } : row));
        await saveHistory(id, "archive", `User with id ${id} archived`);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
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
      setRows(rows.map((row) => row.id === id ? { ...row, standby } : row));
      await saveHistory(id, "standby", `User with id ${id} set to ${standby ? 'StandBY' : 'active'}`);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Fonction pour désarchiver l'utilisateur
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
        setRows(rows.map((row) => row.id === id ? { ...row, archived: false } : row));
        await saveHistory(id, "unarchive", `User with id ${id} unarchived`);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error unarchiving document: ", error);
    }
  };

  // Ajouter une colonne action avec des liens
  const actionColumn: GridColDef = {
    field: "action",
    headerName: "Action",
    width: 50,
    renderCell: (params) => {
      return (
        <div className="action">
          <div>
            <Link to={`/ModalUsers/${params.row.id}`}>
              <img src="/view.svg" alt="View Details" />
            </Link>
          </div>
        </div>
      );
    },
  };

  // Ajouter une colonne suspend pour StandBY avec une case à cocher
  const suspendColumn: GridColDef = {
    field: "StandBY",
    headerName: "StandBY",
    width: 80,
    renderCell: (params) => {
      return (
        <div className="StandBY">
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

  // Ajouter une colonne suprUser pour la suppression
  const suprUser: GridColDef = {
    field: "suprUser",
    headerName: "Suppr",
    width: 50,
    renderCell: (params) => {
      return (
        !params.row.archived && (
          <div className="suprUser" onClick={() => handleDelete(params.row.id)}>
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
    width: 60,
    renderCell: (params) => {
      return (
        <div className="archived">
          {params.row.archived ? (
            <>
              <div style={{ width: 10, height: 10, backgroundColor: 'red', borderRadius: '50%', marginRight: 2 }}></div>
              <Button style={{ width: 10, height: 10, backgroundColor: 'orange', color: 'black' }} onClick={() => handleUnarchive(params.row.id)}>Unarchive</Button>  
            </>
          ) : null}
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
  const getRowClassName = (params: { row: { archived: any; standby: any; verified: any; }; }) => {
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
        columns={[...props.columns, actionColumn, suspendColumn, suprUser, archiveColumn]}
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
