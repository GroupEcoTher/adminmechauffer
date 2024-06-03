import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./single.scss";
import UserDetails from './UserDetails'; // Assurez-vous que cette importation est correcte
//import { getUserById } from '../../config/firebase'; // Import correct de getUserById
import { getUserById } from '/src/config/firebase.js';

const Single = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user: ", error);
      }
    };

    fetchUser();
  }, [userId]);

  const formatFirebaseTimestamp = (firebaseTimestamp) => {
    if (firebaseTimestamp && firebaseTimestamp.seconds && firebaseTimestamp.nanoseconds) {
      return new Date(firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1000000);
    }
    return null;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      {/* Ajoutez d'autres champs selon vos besoins */}
    </div>
  );
};

export default Single;
