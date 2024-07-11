import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridToolbar, GridSortModel, GridPaginationModel } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { Checkbox, Button } from "@mui/material";
import { doc, getDoc, updateDoc, addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import "./dataTable.scss";

// Définition des props pour le composant DataTable
type Props = {
  columns: GridColDef[];
  rows: { id: number; archived: boolean; standby: boolean; verified: boolean; }[];
  title: string;
  slug?: string; // Ajouter slug comme propriété optionnelle
};

const DataTable: React.FC<Props> = ({ columns, rows, title }) => {
  const [tableRows, setTableRows] = useState(rows);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 20,
    page: 0,
  });

  useEffect(() => {
    fetchAndSetUsers();
  }, []);

  const fetchAndSetUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users: { id: number, archived: boolean, standby: boolean, verified: boolean }[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: Number(doc.id), ...doc.data() } as { id: number, archived: boolean, standby: boolean, verified: boolean });
      });
      setTableRows(users);
    } catch (error) {
      console.error("Error fetching users: ", error);
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
    } catch (error) {
      console.error("Error saving history: ", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const userDocRef = doc(db, "users", id.toString());
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, { archived: true });

        console.log(`Archived item with id: ${id} successfully.`);
        setTableRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, archived: true } : row
          )
        );

        await saveHistory(id, "archive", `User with id ${id} archived`);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error archiving document: ", error);
    }
  };

  const handleUnarchive = async (id: number) => {
    try {
      const userDocRef = doc(db, "users", id.toString());
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, { archived: false });

        console.log(`Unarchived item with id: ${id} successfully.`);
        setTableRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, archived: false } : row
          )
        );

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
      setTableRows((prevRows) => prevRows.map((row) => row.id === id ? { ...row, standby } : row));
      await saveHistory(id, "standby", `User with id ${id} set to ${standby ? 'StandBY' : 'active'}`);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

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

  const archiveColumn: GridColDef = {
    field: "archived",
    headerName: "Archivée",
    width: 130,
    renderCell: (params) => {
      return (
        <div className="archived" key={`archived-${params.row.id}`}>
          {params.row.archived ? (
            <>
              
              <Button style={{ width: 100, height: 20, backgroundColor: 'orange', color: 'black' }} onClick={() => handleUnarchive(params.row.id)}>Désarchiver</Button>  
            </>
          ) : (
            <>
              
              <Button style={{ width: 100, height: 20, backgroundColor: 'grey', color: 'white' }} onClick={() => handleUnarchive(params.row.id)}>Archiver</Button>
            </>
          )}
        </div>
      );
    },
  };

  

  const sortModel: GridSortModel = [
    {
      field: 'dateCreation',
      sort: 'desc',
    },
  ];

  const getRowClassName = (params: { row: { archived: any; standby: any; verified: any; }; }) => {
    if (params.row.archived) return 'archivedRow';
    if (params.row.standby) return 'standbyRow';
    if (params.row.verified) return 'verifiedRow';
    return '';
  };

  return (
    <div className="dataTable">
      <h1>{title}</h1>
      <DataGrid
        className="dataGrid"
        rows={tableRows}
        columns={[...columns, actionColumn, suspendColumn, suprUser, archiveColumn]}
        sortModel={sortModel}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
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
