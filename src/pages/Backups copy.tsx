// src/pages/Backups.tsx

import React from 'react';
import { useUserAdmin } from '../components/UserAdminContext'; // Importer le contexte utilisateur
import UserActionsList from '../components/UsersActionsList'; // Importer le composant UserActionsList

const Backups: React.FC = () => {
  const { user } = useUserAdmin(); // Utiliser le contexte utilisateur pour accéder à l'utilisateur connecté

  return (
    <div>
      <h1>Backups</h1>
      {user ? (
        <div>
          <h2>Informations de l'utilisateur</h2>
          <p>ID: {user.uid}</p>
          <p>Email: {user.email}</p>
          <h2>Actions de l'utilisateur</h2>
          <UserActionsList /> {/* Afficher les actions de l'utilisateur */}
        </div>
      ) : (
        <p>Aucun utilisateur connecté.</p>
      )}
    </div>
  );
};

export default Backups;