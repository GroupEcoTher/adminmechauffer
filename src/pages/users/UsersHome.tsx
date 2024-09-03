import React, { useEffect, useState } from 'react';
import ChartBox from "../../components/chartBox/ChartBox";
import BarChartBox from "../../components/barChartBox/BarChartBox";
import "../users/usershome.scss";
import FullLengthBox from "./FullLengthBox";
import { getData, getTotalUsers } from "../../config/firebase";
import {
  barChartBoxRevenue,
  barChartBoxVisit,
  chartBoxConversion,
  chartBoxProduct,
  chartBoxRevenue,
  chartBoxUser,
} from "../../data";
import { ChartBoxProps, BarChartBoxProps, User } from "../../components/types/types";

interface ChartBoxPropsWithNumber extends ChartBoxProps {
  number: string;
}

const chartBoxData: ChartBoxPropsWithNumber[] = [chartBoxUser, chartBoxProduct, chartBoxConversion, chartBoxRevenue];
const barChartBoxData: BarChartBoxProps[] = [barChartBoxVisit, barChartBoxRevenue];

interface UsersHomeProps {
  title: string;
}

const UsersHome: React.FC<UsersHomeProps> = ({ title }) => {
  const [, setUsers] = useState<User[]>([]);
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
        <FullLengthBox totalUsers={totalUsers} />

        {chartBoxData.map((data, index) => (
          <div className={`box box${index + 2}`} key={`chartBox-${index}`}>
            <ChartBox {...data} number={data.number.toString()} />
          </div>
        ))}
  
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
