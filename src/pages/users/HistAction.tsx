import React from 'react';
import FullLengthBox from "../../pages/users/FullLengthBox";
import "../home/home.scss";
import "./Users.scss";


interface UsersProps {
  title: string;
  totalUsers: number; 
}

const HistAction : React.FC<UsersProps> = ({ title, totalUsers }) => {
  return (
    <div className="home">
      <h1 className="page-title">{title}</h1>

        <FullLengthBox totalUsers={totalUsers} />
        
    </div>
  );
};

export default HistAction;
