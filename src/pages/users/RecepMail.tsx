// src/pages/users/RecepMail.tsx
import "../home/home.scss";
import FullLengthBox from "../../pages/users/FullLengthBox";




interface RecepMailProps {
  title: string;
  totalUsers: number; 
}

const RecepMail : React.FC<RecepMailProps> = ({ title, totalUsers }) => {
  return (
    <div className="home">
      <h1 className="page-title">{title}</h1>
      <FullLengthBox totalUsers={totalUsers} />

    </div>
  );
};

export default RecepMail;