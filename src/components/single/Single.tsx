// src/components/single/Single.tsx

import React from 'react';
import "./single.scss";

// Définir les types pour les props de Single
interface SingleProps {
  id: number;
  title: string;
  img: string;
  info: {
    productId: string;
    color: string;
    price: string;
    producer: string;
    export: string;
  };
  chart: {
    dataKeys: { name: string; color: string }[];
    data: { name: string; visits: number; orders: number }[];
  };
  activities: { text: string; time: string }[];
}

const Single: React.FC<SingleProps> = ({ title, img, info, activities }) => {
  return (
    <div className="single">
      <h1>{title}</h1>
      <img src={img} alt={title} />
      <div>
        <h2>Product Information</h2>
        <p>Product ID: {info.productId}</p>
        <p>Color: {info.color}</p>
        <p>Price: {info.price}</p>
        <p>Producer: {info.producer}</p>
        <p>Export: {info.export}</p>
      </div>
      <div>
        <h2>Chart</h2>
        {/* Render chart here */}
      </div>
      <div>
        <h2>Activities</h2>
        <ul>
          {activities.map((activity, index) => (
            <li key={index}>
              {activity.text} - {activity.time}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Single;
