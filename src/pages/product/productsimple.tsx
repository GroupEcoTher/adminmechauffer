
import Single from "../../components/single/Single";
import { singleProduct } from "../../data";
import "./productsimple.scss";

function product() {
  const adaptedSingleProduct = {
    id: singleProduct.id,
    title: singleProduct.title,
    img: singleProduct.img,
    info: {
      username: singleProduct.info.productId,
      fullname: `${singleProduct.title} - ${singleProduct.info.producer}`,
      email: "", // Déterminer comment obtenir ou générer cette information
      phone: "", // Idem pour le téléphone
      status: singleProduct.info.export,
    },
    chart: {
      dataKeys: singleProduct.chart.dataKeys,
      data: singleProduct.chart.data.map(item => ({
        ...item,
        clicks: 0, // Add the 'clicks' property with a default value
      })),
    },
    activities: singleProduct.activities.map(activity => ({
      text: activity.text,
      time: activity.time || "",
    })),
  };

  return (
    <div className="product">
      <Single
        id={adaptedSingleProduct.id}
        title={adaptedSingleProduct.title}
        img={adaptedSingleProduct.img}
        info={adaptedSingleProduct.info}
        chart={adaptedSingleProduct.chart}
        activities={adaptedSingleProduct.activities}
      />
    </div>
  );
}

export default product;
