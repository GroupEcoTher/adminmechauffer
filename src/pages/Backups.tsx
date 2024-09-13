import React, { useState } from 'react';
import { useUserAdmin } from '../components/UserAdminContext'; // Importer le contexte utilisateur
import UserActionsList from '../components/UsersActionsList'; // Importer le composant UserActionsList
import AdminUserList from '../components/AdminUserList'; // Importer le composant AdminUserList
import { User } from '../components/types/types';



const Backups: React.FC = () => {
  const { user } = useUserAdmin(); // Utiliser le contexte utilisateur pour accéder à l'utilisateur connecté
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div>
      <h1>Backups</h1>
      {user ? (
        <div>
          <h2>Informations de l'utilisateur connecté</h2>
          <p>ID: {user.uid}</p>
          <p>Email: {user.email}</p>
          <h2>Actions de l'utilisateur connecté</h2>
          <UserActionsList /> {/* Afficher les actions de l'utilisateur */}
        </div>
      ) : (
        <p>Aucun utilisateur connecté.</p>
      )}

      <h1>Liste des utilisateurs administrateurs</h1>
      <AdminUserList onSelectUser={handleSelectUser} /> {/* Afficher la liste des utilisateurs administrateurs */}
      {selectedUser ? (
        <div>
          <h2>Informations de l'utilisateur sélectionné</h2>
          <p>ID: {selectedUser.uid}</p>
          <p>Email: {selectedUser.email}</p>
          <h2>Actions de l'utilisateur sélectionné</h2>
          <UserActionsList /> {/* Afficher les actions de l'utilisateur */}
        </div>
      ) : (
        <p>Sélectionnez un utilisateur pour voir les détails.</p>
      )}
    </div>
  );
};

export default Backups;