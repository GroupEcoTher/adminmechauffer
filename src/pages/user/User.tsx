// src/pages/user/User.tsx

import React from 'react';
import Single from "../../components/single/Single";
import "./user.scss";

// Définir les types des props pour le composant User
interface UserProps {
  title: string;
}

const User: React.FC<UserProps> = ({ title }) => {
  // Définir les éléments de la page user singleUser
  const singleUser = {
    id: 1,
    title: title, // Utiliser la prop title ici
    img: "https://images.pexels.com/photos/17397364/pexels-photo-17397364.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
    info: {
      username: "Johndoe99",
      fullname: "John Doe",
      email: "johndoe@gmail.com",
      phone: "123 456 789",
      status: "verified",
    },
    chart: {
      dataKeys: [
        { name: "visits", color: "#82ca9d" },
        { name: "clicks", color: "#8884d8" },
      ],
      data: [
        {
          name: "Sun",
          visits: 4000,
          clicks: 2400,
        },
        {
          name: "Mon",
          visits: 3000,
          clicks: 1398,
        },
        {
          name: "Tue",
          visits: 2000,
          clicks: 3800,
        },
        {
          name: "Wed",
          visits: 2780,
          clicks: 3908,
        },
        {
          name: "Thu",
          visits: 1890,
          clicks: 4800,
        },
        {
          name: "Fri",
          visits: 2390,
          clicks: 3800,
        },
        {
          name: "Sat",
          visits: 3490,
          clicks: 4300,
        },
      ],
    },
    activities: [
      {
        text: "Ici les dernières activités d'Elyes ou de Jarod",
      },
      {
        text: "Ici les dernières activités d'Elyes ou de Jarod",
        time: "1 week ago",
      },
      {
        text: "Ici les dernières activités d'Elyes ou de Jarod",
        time: "2 weeks ago",
      },
      {
        text: "Ici les dernières activités d'Elyes ou de Jarod",
        time: "1 month ago",
      },
      {
        text: "Ici les dernières activités d'Elyes ou de Jarod",
        time: "1 month ago",
      },
      {
        text: "Ici les dernières activités d'Elyes ou de Jarod",
        time: "2 months ago",
      },
    ],
  };

  return (
    <div className="user">
      <Single {...singleUser} />
    </div>
  );
}

export default User;
