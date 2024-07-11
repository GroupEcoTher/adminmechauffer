import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase'; // Assurez-vous d'importer correctement votre configuration Firebase
import './styles.css'; // Assurez-vous que le chemin est correct

interface LoginProps {
  title: string;
}

const Login: React.FC<LoginProps> = ({ title }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Rediriger vers la page d'accueil après la connexion
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>{title}</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div className="legal-section">
        <h2>Mentions Légales</h2>
        <p>
          <strong>Nom de l'entreprise :</strong> Votre Entreprise<br />
          <strong>Adresse :</strong> 123 Rue Exemple, 75001 Paris, France<br />
          <strong>Téléphone :</strong> +33 1 23 45 67 89<br />
          <strong>Email :</strong> contact@votreentreprise.com<br />
          <strong>SIRET :</strong> 123 456 789 00010<br />
          <strong>Directeur de la publication :</strong> John Doe<br />
        </p>

        <h2>Contact pour Assistance</h2>
        <p>
          Si vous rencontrez des problèmes de connexion, veuillez contacter l'administrateur :
        </p>
        <p>
          <strong>Email :</strong> admin@votreentreprise.com<br />
          <strong>Téléphone :</strong> +33 1 23 45 67 89<br />
        </p>
      </div>
    </div>
  );
};

export default Login;
