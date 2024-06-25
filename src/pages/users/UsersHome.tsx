// UsersHome.tsx
import React, { useEffect, useState } from 'react';
import ChartBox from "../../components/chartBox/ChartBox";
import BarChartBox from "../../components/barChartBox/BarChartBox";
import "../users/Usershome.scss";
import FullLengthBox from "../../pages/users/FullLengthBox";
import { getData, getTotalUsers } from "../../config/firebase";
import {
  barChartBoxRevenue,
  barChartBoxVisit,
  chartBoxConversion,
  chartBoxProduct,
  chartBoxRevenue,
  chartBoxUser,
} from "../../data";
import { ChartBoxProps, BarChartBoxProps, User } from "../../types";

const chartBoxData: ChartBoxProps[] = [chartBoxUser, chartBoxProduct, chartBoxConversion, chartBoxRevenue];
const barChartBoxData: BarChartBoxProps[] = [barChartBoxVisit, barChartBoxRevenue];

interface UsersHomeProps {
  title: string;
}

const UsersHome: React.FC<UsersHomeProps> = ({ title }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getData();
      const totalUsersCount = await getTotalUsers();
      setUsers(usersData);
      setTotalUsers(totalUsersCount);
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="home">
        <h1 className="page-title">{title}</h1>
        <FullLengthBox totalUsers={totalUsers} /> {/* Passer totalUsers à FullLengthBox */}

        {chartBoxData.map((data, index) => (
          <div className={`box box${index + 2}`} key={`chartBox-${index}`}>
            <ChartBox {...data} />
          </div>
        ))}
        
        {/* <div className="box box4"><PieChartBox /></div> Leadds by Source */}
        
        {/* <div className="box box7"><BigChartBox /></div> Analytics Global */}

        {/* <div className="box box1"><TopBox /></div> Top */}

        {barChartBoxData.map((data, index) => (
          <div className={`box box${index + 6}`} key={`barChartBox-${index}`}>
            <BarChartBox {...data} />
          </div>
        ))}
      </div>
    </>
  );
};

export default UsersHome;
