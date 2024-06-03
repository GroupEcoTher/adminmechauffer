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

const chartBoxData = [chartBoxUser, chartBoxProduct, chartBoxConversion, chartBoxRevenue];
const barChartBoxData = [barChartBoxVisit, barChartBoxRevenue];

const UsersHome = ({ title }) => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getData();
      const totalUsersCount = await getTotalUsers('user'); // Remplacez 'user' par le rôle souhaité

      setUsers(usersData);
      setTotalUsers(totalUsersCount);
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
            <li key={user.id}>{user.name} - {user.email}</li> // Remplacez name et email par les champs appropriés de votre collection users
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UsersHome;
