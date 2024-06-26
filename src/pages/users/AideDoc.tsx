// src/pages/users/AideDoc.tsx
import "../home/home.scss";
import FullLengthBox from "../../pages/users/FullLengthBox";


interface AideDocProps {
  title: string;
  totalUsers: number; 
}


const AideDoc :   React.FC<AideDocProps> = ({ title, totalUsers }) => {
  return (
    <div className="home">
      <h1 className="page-title">{title}</h1>

        <FullLengthBox totalUsers={totalUsers} />
        
    </div>
  );
};
export default AideDoc;