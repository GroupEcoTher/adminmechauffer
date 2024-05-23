import React from 'react';
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
import "../home/home.scss";
import FullLengthBox from "../../pages/users/FullLengthBox";

const chartBoxData = [chartBoxUser, chartBoxProduct, chartBoxConversion, chartBoxRevenue];
const barChartBoxData = [barChartBoxVisit, barChartBoxRevenue];

const UsersHome = ({ title }) => {
  return (
    <>

      <div className="home">
        <FullLengthBox />
        <h1>{title}</h1>
        
        <div className="box box1">
          <TopBox />
        </div>
        {chartBoxData.map((data, index) => (
          <div className={`box box${index+2}`}>
            <ChartBox {...data} />
          </div>
        ))}
        <div className="box box4">
          <PieChartBox />
        </div>
        <div className="box box7">
          <BigChartBox />
        </div>
        {barChartBoxData.map((data, index) => (
          <div className={`box box${index+8}`}>
            <BarChartBox {...data} />
          </div>
        ))}
      </div>
    </>
  );
};
export default UsersHome;