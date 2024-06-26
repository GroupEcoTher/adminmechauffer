//src\pages\product\Product.tsx

import Single from "../../components/single/Single"
import { singleProduct } from "../../data"
import "./product.scss"

function Product() {
  const adaptedSingleProduct = {
    username: singleProduct.info.productId,
    fullname: `${singleProduct.title} - ${singleProduct.info.producer}`,
    email: "", // Vous devrez déterminer comment obtenir ou générer cette information
    phone: "", // Idem pour le téléphone
    status: singleProduct.info.export,
    // Assurez-vous d'inclure toutes les autres propriétés attendues par SingleProps
  };

  return (
    <div className="product">
       <Single id={0} title={""} img={""} info={{
        username: "",
        fullname: "",
        email: "",
        phone: "",
        status: ""
      }} chart={{
        dataKeys: [],
        data: []
      }} activities={[]} {...adaptedSingleProduct}/>
    </div>
  );
}

export default Product