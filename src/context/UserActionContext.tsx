// src/context/UserActionContext.tsx

//Le contexte permet de partager l'état des actions des users et les fonctions associées à travers toute l'application 

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserAction } from '../components/types/types';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface UserActionContextProps {
  actions: UserAction[];  // Liste des actions des utilisateurs
  addAction: (action: UserAction) => void; // Fonction pour ajouter une action
}

const UserActionContext = createContext<UserActionContextProps | undefined>(undefined);

export const UserActionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<UserAction[]>([]);

  const addAction = async (action: UserAction) => {
    setActions((prevActions) => [...prevActions, action]);
    try {
      await addDoc(collection(db, 'userActions'), action); // Enregistrer l'action dans Firebase
    } catch (error) {
      console.error('Error adding action: ', error);
    }
  };

  return (
    <UserActionContext.Provider value={{ actions, addAction }}>
      {children}
    </UserActionContext.Provider>
  );
};

export const useUserAction = () => {
  const context = useContext(UserActionContext);
  if (!context) {
    throw new Error('useUserAction must be used within a UserActionProvider');
  }
  return context;
};