import { Link } from "react-router-dom";
import "../../components/menu/menu.scss";
import "./menu.scss";
import { menu} from "../../data";


export interface ListItem {
  id: number;
  title: string;
  url?: string;
  icon: string;
}

export interface MenuItem {
  id: number;
  title: string;
  listItems: ListItem[];
}


// Composant Menu qui retourne une liste d'éléments de menu
const Menu = () => {
  return (
    <div className="menu">
      {menu.map((item: MenuItem) => (
        // Chaque élément de menu a une clé unique basée sur son id
        <div className="item" key={item.id}>
          <span className="title">{item.title}</span>
          {item.listItems.map((listItem: ListItem) => (
            // Assurez-vous que chaque listItem a une clé unique basée sur son id
            <Link to={listItem.url || ""} className="listItem" key={listItem.id}>
              <img src={listItem.icon} alt={listItem.title} />
              <span className="listItemTitle">{listItem.title}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Menu;
