// src/components/users/FullLengthBox.tsx

import { useNavigate } from 'react-router-dom'; // Importez useNavigate

const ParainsFullLengthBox = () => {
  const navigate = useNavigate(); // Utilisez useNavigate pour obtenir la fonction navigate

  return (
    <div className="fullLengthBox">
      {/* Contenu de la boîte en pleine largeur */}
      <button className="hoverEffect" onClick={() => navigate('/UsersHome')}>Gestion Users <br /> États traitements</button>
      <button className="hoverEffect" onClick={() => navigate('/RecepMail')}>Réception Mails</button>
      <button className="hoverEffect" onClick={() => navigate('/QuestDem')}>Questions Demandes Litiges</button>
      <button className="hoverEffect" onClick={() => navigate('/UsersHome')}>Gestion Users <br /> États traitements</button>
      <button className="hoverEffect" onClick={() => navigate('/HistAction')}>Historique des actions Résumé d’utilisation</button>
      <button className="hoverEffect" onClick={() => navigate('/AideDoc')}>Aide <br />Documentation</button>
    </div>
  );
};

export default ParainsFullLengthBox;