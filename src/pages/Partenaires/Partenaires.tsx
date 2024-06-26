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
import PartenairesFullLengthBox from "../../pages/Partenaires/PartenairesFullLengthBox";

const chartBoxData = [chartBoxUser, chartBoxProduct, chartBoxConversion, chartBoxRevenue];
const barChartBoxData = [barChartBoxVisit, barChartBoxRevenue];


// Définir les props pour PartenairesHome
interface PartenairesHomeProps {
  title: string;
}

// Définir le composant PartenairesHome en utilisant les props
const PartenairesHome: React.FC<PartenairesHomeProps> = ({ title }) => {
  return (
    <>
      <div className="home">
        <h1 className="page-title">{title}</h1>
        <PartenairesFullLengthBox /> {/* Utilisation du composant correctement nommé */}
        
        <div className="box box1">
          <TopBox />
        </div>
        {chartBoxData.map((data, index) => (
          <div className={`box box${index+2}`} key={index}>
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
          <div className={`box box${index+8}`} key={index}>
            <BarChartBox {...data} />
          </div>
        ))}
      </div>
    </>
  );
};

export default PartenairesHome;







