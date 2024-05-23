// src/components/users/FullLengthBox.tsx
import React from 'react';

const PartenairesFullLengthBox = () => {
  return (
    <div className="fullLengthBox">
      {/* Contenu de la boîte en pleine largeur */}
      <button className="hoverEffect" onClick={() => history.push('/UsersHome')}>Gestion Users <br /> États traitements</button>
      <button className="hoverEffect" onClick={() => history.push('/RecepMail')}>Réception Mails</button>
      <button className="hoverEffect" onClick={() => history.push('/QuestDem')}>Questions Demandes Litiges</button>
      <button className="hoverEffect" onClick={() => history.push('/UsersHome')}>Gestion Users <br /> États traitements</button>
      <button className="hoverEffect" onClick={() => history.push('/HistAction')}>Historique des actions Résumé d’utilisation</button>
      <button className="hoverEffect" onClick={() => history.push('/AideDoc')}>Aide <br />Documentation</button>
    </div>
  );
};

export default PartenairesFullLengthBox;