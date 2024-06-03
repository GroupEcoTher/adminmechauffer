// src/pages/users/AideDoc.tsx


import "../home/home.scss";
import FullLengthBox from "../../pages/users/FullLengthBox";


const AideDoc = ({ title }) =>{
  return (
    <div className="home">
      <h1 className="page-title">{title}</h1>
      <FullLengthBox />

    </div>
  );
};
export default AideDoc;