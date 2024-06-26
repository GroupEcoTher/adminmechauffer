import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './FullLengthBox.scss';


interface FullLengthBoxProps {
  totalUsers: number;
}


const FullLengthBox: React.FC<FullLengthBoxProps> = ({ totalUsers }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => (location.pathname === path ? 'active' : '');

  return (
    <div className="fullLengthBox">
      <button className={`hoverEffect ${isActive('/UsersHome')}`} onClick={() => navigate('/UsersHome')}>
        Home Users <span className="total-users">{totalUsers ? `(${totalUsers})` : ''}</span>
      </button>
      <button className={`hoverEffect ${isActive('/UsersTraitements')}`} onClick={() => navigate('/UsersTraitements')}>Gestion Users <br /> États traitements</button>
      <button className={`hoverEffect ${isActive('/RecepMail')}`} onClick={() => navigate('/RecepMail')}>Réception Mails</button>
      <button className={`hoverEffect ${isActive('/QuestDem')}`} onClick={() => navigate('/QuestDem')}>Questions Demandes via le Site</button>
      <button className={`hoverEffect ${isActive('/HistAction')}`} onClick={() => navigate('/HistAction')}>Historique des actions Résumé d’utilisation</button>
      <button className={`hoverEffect ${isActive('/AideDoc')}`} onClick={() => navigate('/AideDoc')}>Aide <br />Documentation</button>
    </div>
  );
};

export default FullLengthBox;
