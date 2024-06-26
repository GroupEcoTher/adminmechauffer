// src/components/single/Single.tsx

import React from 'react';

// Définir les types des props pour le composant Single
interface ChartData {
  name: string;
  visits: number;
  clicks: number;
}

interface Activity {
  text: string;
  time?: string;
}

export interface SingleProps {
  id: number;
  title: string;
  img: string;
  info: {
    username: string;
    fullname: string;
    email: string;
    phone: string;
    status: string;
  };
  chart: {
    dataKeys: {
      name: string;
      color: string;
    }[];
    data: ChartData[];
  };
  activities: Activity[];
}

const Single: React.FC<SingleProps> = ({ title, img, info, activities }) => {
  // Composant Single
  return (
    <div className="single">
      <h2>{title}</h2>
      <img src={img} alt={title} />
      <div>
        <h3>Information</h3>
        <p>Username: {info.username}</p>
        <p>Fullname: {info.fullname}</p>
        <p>Email: {info.email}</p>
        <p>Phone: {info.phone}</p>
        <p>Status: {info.status}</p>
      </div>
      <div>
        <h3>Chart</h3>
        {/* Rendre le graphique ici */}
      </div>
      <div>
        <h3>Activities</h3>
        {activities.map((activity, index) => (
          <div key={index}>
            <p>{activity.text}</p>
            {activity.time && <p>{activity.time}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Single;
