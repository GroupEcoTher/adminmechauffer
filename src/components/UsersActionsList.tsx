// src/components/UserActionsList.tsx

// Ce composant récupère les actions depuis FireBase et les affiche dans une liste

import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UserAction } from './types/types';

const UserActionsList: React.FC = () => {
  const [actions, setActions] = useState<UserAction[]>([]);

  useEffect(() => {
    const fetchActions = async () => {
      const querySnapshot = await getDocs(collection(db, 'userActions'));
      const actionsList = querySnapshot.docs.map(doc => doc.data() as UserAction);
      setActions(actionsList);
    };

    fetchActions();
  }, []);

  return (
    <div>
      <h2>Actions des utilisateurs</h2>
      <ul>
        {actions.map((action, index) => (
          <li key={index}>
            {action.timestamp.toString()} - {action.actionType} - {action.details}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserActionsList;