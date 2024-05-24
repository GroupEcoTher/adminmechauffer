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
import "./Users.scss";



const Users = ({ title }) =>{
  return (
    <div className="home">
      <h1 className="page-title">{title}</h1>
      <FullLengthBox />

    </div>
  );
};

export default Users;