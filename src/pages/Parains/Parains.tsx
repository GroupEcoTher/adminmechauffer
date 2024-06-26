//src\pages\Parains\Parains.tsx

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
import ParainsFullLengthBox from "../../pages/Parains/ParainsFullLengthBox";



const chartBoxData = [chartBoxUser, chartBoxProduct, chartBoxConversion, chartBoxRevenue];
const barChartBoxData = [barChartBoxVisit, barChartBoxRevenue];


interface ParainsProps {
  title: string;
}


const Parains: React.FC<ParainsProps> = ({ title }) => {
  return (
    <>

      <div className="home">
      <h1 className="page-title">{title}</h1>
        <ParainsFullLengthBox />
              
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
export default Parains;