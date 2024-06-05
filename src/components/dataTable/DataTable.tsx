

import {
  DataGrid,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import "./dataTable.scss";
import { Link } from "react-router-dom";


type Props = {
  columns: GridColDef[];
  rows: object[];
  slug: string;
};

const DataTable = (props: Props) => {
  const handleDelete = (id: number) => {
    // Code pour supprimer l'élément
    console.log(`Delete item with id: ${id}`);
  };

  const actionColumn: GridColDef = {
    field: "action",
    headerName: "Action",
    width: 20,
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

  const suspendColumn: GridColDef = {
    field: "StandBY",
    headerName: "StandBY",
    width: 20,
    renderCell: (params) => {
      return (
        <div className="StandBY" onClick={() => handleDelete(params.row.id)}>
          <img src="/pause.jpg" alt="Suspend" />
        </div>
      );
    },
  };

  const suprUser: GridColDef = {
    field: "suprUser",
    headerName: "Suppr",
    width: 20,
    renderCell: (params) => {
      return (
        <div className="suprUser" onClick={() => handleDelete(params.row.id)}>
          <img src="/delete.svg" alt="Delete" />
        </div>
      );
    },
  };


  return (
    <div className="dataTable">

      <DataGrid
        className="dataGrid"
        rows={props.rows}
        columns={[...props.columns, actionColumn, suspendColumn, suprUser]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 20,
            },
          },
        }}
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
      />
    </div>
  );
};

export default DataTable;