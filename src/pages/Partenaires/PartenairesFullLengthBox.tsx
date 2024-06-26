import { useNavigate, useLocation } from 'react-router-dom';

// Typage pour le paramètre path
const isActive = (location: ReturnType<typeof useLocation>, path: string): string => 
  location.pathname === path ? 'active' : '';

const PartenairesFullLengthBox: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fullLengthBox">
      <button className={`hoverEffect ${isActive(location, '/UsersHome')}`} onClick={() => navigate('/UsersHome')}>Home Partenaires</button>
      <button className={`hoverEffect ${isActive(location, '/UsersTraitements')}`} onClick={() => navigate('/UsersTraitements')}>Gestion Partenaires <br /> États traitements</button>
      <button className={`hoverEffect ${isActive(location, '/RecepMail')}`} onClick={() => navigate('/RecepMail')}>Réception Mails</button>
      <button className={`hoverEffect ${isActive(location, '/QuestDem')}`} onClick={() => navigate('/QuestDem')}>Questions Demandes via le Site</button>
      <button className={`hoverEffect ${isActive(location, '/HistAction')}`} onClick={() => navigate('/HistAction')}>Historique des actions Résumé d’utilisation</button>
      <button className={`hoverEffect ${isActive(location, '/AideDoc')}`} onClick={() => navigate('/AideDoc')}>Aide <br />Documentation</button>
    </div>
  );
};

export default PartenairesFullLengthBox;
