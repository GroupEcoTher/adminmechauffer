//src\pages\login\Login.tsx
import React from 'react';

// Définir les props pour Login
interface LoginProps {
  title: string;
}

const Login: React.FC<LoginProps> = ({ title }) => {
  return (
    <div>
      <h1>{title}</h1>
      {/* Autre contenu du composant */}
    </div>
  );
};

export default Login;
