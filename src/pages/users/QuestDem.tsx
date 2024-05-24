// src/pages/users/QuestDem.tsx
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


const QuestDem = ({ title }) =>{
  return (
    <div className="home">
      <h1 className="page-title">{title}</h1>
      <FullLengthBox />

    </div>
  );
};

export default QuestDem;