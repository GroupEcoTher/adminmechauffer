import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../config/firebase'; // Assurez-vous d'importer correctement votre configuration Firebase
import './login.scss'; // Assurez-vous que le chemin est correct

interface LoginProps {
  title: string;
}

const Login: React.FC<LoginProps> = ({ title }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Vérifiez l'utilisateur connecté au chargement du composant
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Gérer la déconnexion
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Gérer la connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const hardcodedEmail = 'admin@bricemechauffer@gmail.com';
    const hardcodedPassword = 'mechauffertest';
    const hardcodedFirstname = 'admin1';

    if (email === hardcodedEmail && password === hardcodedPassword && firstname === hardcodedFirstname) {
      const user = { email: hardcodedEmail, firstname: hardcodedFirstname };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/'); // Rediriger vers la page d'accueil après la connexion
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUser({ ...user, firstname });
      localStorage.setItem('user', JSON.stringify({ ...user, firstname }));
      navigate('/'); // Rediriger vers la page d'accueil après la connexion
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <h1>{title}</h1>
      {user ? (
        <div>
          <p>Connecté en tant que : {user.email} ({user.firstname})</p>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleLogin}>
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
          <input
            type="text"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            placeholder="Prénom"
            required
          />
          <button type="submit">Login</button>
        </form>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="legal-section">
        <h2>Sécurité et Conformité</h2>
        <p>
          Vos activités sur ce site sont surveillées pour des raisons de sécurité. Toute tentative d'accès non autorisé ou de manipulation des données sera signalée et pourra entraîner des poursuites judiciaires.
        </p>
        <p>
          L'accès à ce système est strictement réservé aux utilisateurs autorisés. Seuls les employés disposant des privilèges nécessaires peuvent accéder aux différentes sections de ce site. Toute violation de ces règles peut entraîner des sanctions disciplinaires et légales.
        </p>
        <p>
          Pour votre sécurité, utilisez des mots de passe complexes et uniques. L'activation de l'authentification multi-facteurs (MFA) est recommandée pour une protection accrue.
        </p>
        <p>
          Assurez-vous que vos systèmes et logiciels sont à jour avec les dernières mises à jour de sécurité pour prévenir les vulnérabilités.
        </p>
        <p>
          Nous encourageons tous les utilisateurs à signaler immédiatement toute activité suspecte. Votre vigilance est essentielle pour maintenir la sécurité de notre système.
        </p>

        <h2>Avertissements et Mentions Légales</h2>
        <p>
          Ce site est protégé par le Règlement Général sur la Protection des Données (RGPD). En vous connectant, vous acceptez nos termes et conditions d'utilisation ainsi que notre politique de confidentialité.
        </p>
        <p>
          L'accès à ce système est strictement réservé aux employés autorisés du Groupe Eco Thermique. Toute tentative d'accès non autorisé sera enregistrée et signalée aux autorités compétentes.
        </p>
        <p>
          Pour toute question concernant vos données personnelles, veuillez nous contacter à l'adresse suivante : <a href="mailto:contact@groupe-eco-thermique.fr">contact@groupe-eco-thermique.fr</a>.
        </p>
        <p>
          En cas de problème technique, contactez notre support technique au +33 1 89 70 60 29.
        </p>
        <p>
          Adresse : 9 rue de la Pompe, 95800 CERGY
        </p>

        <h2>Mentions Légales</h2>
        <p>
          <strong>Nom de l'entreprise :</strong> Groupe Eco Thermique<br />
          <strong>Téléphone :</strong> +33 1 89 70 60 29<br />
          <strong>Email :</strong> contact@groupe-eco-thermique.fr<br />
        </p>

        <h2>Contact pour Assistance</h2>
        <p>
          Si vous rencontrez des problèmes de connexion, veuillez contacter l'administrateur :
        </p>
        <p>
          <strong>Email :</strong> admin@groupe-eco-thermique.fr<br />
          <strong>Téléphone :</strong> +33 1 89 70 60 29<br />
        </p>
      </div>
    </div>
  );
};

export default Login;
