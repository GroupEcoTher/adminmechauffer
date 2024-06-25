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
import "./home.scss";

//const chartBoxData = [chartBoxUser, chartBoxProduct, chartBoxConversion, chartBoxRevenue];
//const barChartBoxData = [barChartBoxVisit, barChartBoxRevenue];

const Home = ({ title }) => {
  return (
    <div className="home">
      <h3 className="page-title">{title}</h3>
      
      <div className="box box1">
        <TopBox />
      </div>
      <div className="box box2">
        <ChartBox color={""} icon={""} {...chartBoxUser} />
      </div>
      <div className="box box3">
        <ChartBox color={""} icon={""} {...chartBoxProduct} />
      </div>
      <div className="box box4">
        <PieChartBox />
      </div>
      <div className="box box5">
        <ChartBox color={""} icon={""} {...chartBoxConversion} />
      </div>
      <div className="box box6">
        <ChartBox color={""} icon={""} {...chartBoxRevenue} />
      </div>
      <div className="box box7">
        <BigChartBox />
      </div>
      <div className="box box8">
        <BarChartBox {...barChartBoxVisit} />
      </div>
      <div className="box box9">
        <BarChartBox {...barChartBoxRevenue} />
      </div>
    </div>
  );
};

export default Home;
