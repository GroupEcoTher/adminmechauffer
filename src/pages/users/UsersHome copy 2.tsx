import React, { useEffect, useState } from 'react';
import BarChartBox from "../../components/barChartBox/BarChartBox";
import BigChartBox from "../../components/bigChartBox/BigChartBox";
import ChartBox from "../../components/chartBox/ChartBox";
import PieChartBox from "../../components/pieCartBox/PieChartBox";
import TopBox from "../../components/topBox/TopBox";
import {
  barChartBoxRevenue,
  barChartBoxVisit,
  chartBoxConversion,
  chartBoxProduct,
  chartBoxRevenue,
  chartBoxUser,
} from "../../data";
import "../users/usersHome.scss";
import FullLengthBox from "../../pages/users/FullLengthBox";

// Import des fonctions de récupération de données
import { getDataAdressebyUserID, getDataDemandesbyUserID } from '../src/components/config/firebase.js';

const chartBoxData = [chartBoxUser, chartBoxProduct, chartBoxConversion, chartBoxRevenue];
const barChartBoxData = [barChartBoxVisit, barChartBoxRevenue];

const UsersHome = ({ title }) => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAdresses, setTotalAdresses] = useState(0);
  const [totalDemandes, setTotalDemandes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Récupération du nombre total d'utilisateurs
      const usersData = await getData();
      const totalUsersCount = await getTotalUsers('user');

      // Récupération du nombre total d'adresses
      const adressesData = await getDataAdressebyUserID('user'); // Remplacez 'user' par l'ID de l'utilisateur
      const totalAdressesCount = adressesData.length;

      // Récupération du nombre total de demandes
      const demandesData = await getDataDemandesbyUserID('user'); // Remplacez 'user' par l'ID de l'utilisateur
      const totalDemandesCount = demandesData.length;

      // Mise à jour de l'état avec les données récupérées
      setUsers(usersData);
      setTotalUsers(totalUsersCount);
      setTotalAdresses(totalAdressesCount);
      setTotalDemandes(totalDemandesCount);
    };

    fetchData();
  }, []);

  return (
    <div className="home">
      <h1 className="page-title">{title}</h1>
      <FullLengthBox />
      <div className="box box10">
        <h2>Total Users: {totalUsers}</h2>
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name} - {user.email}</li>
          ))}
        </ul>
      </div>
      <div className="box box11">
        <h2>Total Adresses: {totalAdresses}</h2>
        {/* Afficher d'autres informations sur les adresses si nécessaire */}
      </div>
      <div className="box box12">
        <h2>Total Demandes: {totalDemandes}</h2>
        {/* Afficher d'autres informations sur les demandes si nécessaire */}
      </div>
    </div>
  );
};

export default UsersHome;
