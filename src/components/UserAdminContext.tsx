// src/components/UserAdminContext.tsx

//  le suivi des actions des utilisateurs dans les composants où cela est nécessaire. 
// Cela inclu une fonction addaction pour enregistrer les actions de l'utilisateur dans la base de données Firestore.




import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { UserAction } from '../components/types/types';

interface UserAdminContextType {
  user: any; // Utilisateur actuellement connecté
  loading: boolean; // Indicateur de chargement
  logout: () => void; // Fonction pour déconnecter l'utilisateur
  addAction: (action: UserAction) => void; // Fonction pour ajouter une action
}

const UserAdminContext = createContext<UserAdminContextType | undefined>(undefined);

export const UserAdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setActions] = useState<UserAction[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    addAction({ actionType: 'logout', timestamp: new Date(), userId: user?.uid });
    setUser(null);
  };

  const addAction = async (action: UserAction) => {
    setActions((prevActions) => [...prevActions, action]);
    try {
      await addDoc(collection(db, 'userActions'), action);
    } catch (error) {
      console.error('Error adding action: ', error);
    }
  };

  return (
    <UserAdminContext.Provider value={{ user, loading, logout, addAction }}>
      {children}
    </UserAdminContext.Provider>
  );
};

export const useUserAdmin = () => {
  const context = useContext(UserAdminContext);
  if (context === undefined) {
    throw new Error('useUserAdmin must be used within a UserAdminProvider');
  }
  return context;
};