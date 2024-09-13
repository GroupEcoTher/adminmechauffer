// src/components/navbar/Navbar.tsx

import React from 'react';
import { useUserAdmin } from '../UserAdminContext'; // Importer le contexte utilisateur
import { useUserAction } from '../../context/UserActionContext'; // Importer le contexte des actions des utilisateurs
import "./navbar.scss";

const Navbar: React.FC = () => {
  const { user, logout } = useUserAdmin(); // Utiliser le contexte utilisateur pour accéder à l'état de connexion et à la fonction de déconnexion
  const { addAction } = useUserAction(); // Utiliser le contexte des actions des utilisateurs

  const handleLogout = () => {
    addAction({ actionType: 'logout', timestamp: new Date(), userId: user.id });
    logout();
  };

  return (
    <div className="navbar">
      <div className="logo">
        <img src="logoadmin.jpg" alt="Logo Admin" />
        <span>Admin Me Chauffer</span>
      </div>
      <div className="icons">
        <img src="/search.svg" alt="Search" className="icon" />
        <img src="/app.svg" alt="App" className="icon" />
        <img src="/expand.svg" alt="Expand" className="icon" />
        <div className="notification">
          <img src="/notifications.svg" alt="Notifications" />
          <span>1</span>
        </div>
        <div className="user">
          <img
            src="https://images.pexels.com/photos/11038549/pexels-photo-11038549.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load"
            alt="User Avatar"
          />
          {/* Afficher le prénom de l'utilisateur connecté et ajouter un bouton de déconnexion */}
          <span>{user ? `${user.firstname}` : 'NOM DE L\'ADMIN LOGUE'}</span>
          {user && <button onClick={handleLogout}>Déconnexion</button>}
        </div>
        <img src="/settings.svg" alt="Settings" className="icon" />
      </div>
    </div>
  );
};

export default Navbar;