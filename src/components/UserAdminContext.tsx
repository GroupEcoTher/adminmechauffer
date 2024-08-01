//src\components\UseradminContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

interface UserAdminContextType {
  user: any;
  loading: boolean;
  logout: () => void;
}

const UserAdminContext = createContext<UserAdminContextType | undefined>(undefined);

export const UserAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <UserAdminContext.Provider value={{ user, loading, logout }}>
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
