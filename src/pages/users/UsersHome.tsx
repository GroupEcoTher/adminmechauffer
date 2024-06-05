import React, { useEffect, useState } from 'react';
import ChartBox from "../../components/chartBox/ChartBox";
import BarChartBox from "../../components/barChartBox/BarChartBox";
//import BigChartBox from "../../components/bigChartBox/BigChartBox";
//import PieChartBox from "../../components/pieCartBox/PieChartBox";
//import TopBox from "../../components/topBox/TopBox";

import {
  barChartBoxRevenue,
  barChartBoxVisit,
  chartBoxConversion,
  chartBoxProduct,
  chartBoxRevenue,
  chartBoxUser,
  //barChartBoxValidated,
} from "../../data";
import "../users/Usershome.scss";
import FullLengthBox from "../../pages/users/FullLengthBox";



const chartBoxData = [chartBoxUser, chartBoxProduct, chartBoxConversion, chartBoxRevenue];
const barChartBoxData = [barChartBoxVisit, barChartBoxRevenue];

const UsersHome = ({ title }) => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getData();
      const totalUsersCount = await getTotalUsers('user'); 
      setUsers(usersData);
      setTotalUsers(totalUsersCount);
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="home">
        <h1 className="page-title">{title}</h1>
        <FullLengthBox />

        {chartBoxData.map((data, index) => (
          <div className={`box box${index+2}`} key={index}>
            <ChartBox {...data} />
          </div>
        ))}
        
        {/*<div className="box box4"><PieChartBox /></div>{/*Leads by Source*/}
        
        {/*<div className="box box7"><BigChartBox /></div> {/*Analytics Global*/}

        {/*<div className="box box1"><TopBox /></div> {/*Top*/}


        {barChartBoxData.map((data, index) => (
          <div className={`box box${index+2}`} key={index}>
            <BarChartBox {...data} />
          </div>
        ))}

      </div>
    </>
  );
};

export default UsersHome;