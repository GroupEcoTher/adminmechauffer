import "../home/home.scss";
import FullLengthBox from "../../pages/users/FullLengthBox";

// Définir une interface pour les props
interface QuestDemProps {
  title: string;
}

// Utiliser cette interface dans le composant
const QuestDem: React.FC<QuestDemProps> = ({ title }) => {
  // Simuler la récupération du nombre total d'utilisateurs
  const totalUsers = 100; // Remplacer par la valeur appropriée ou logique de récupération

  return (
    <div className="home">
      <h1 className="page-title">{title}</h1>
      <FullLengthBox totalUsers={totalUsers} />
    </div>
  );
};

export default QuestDem;
