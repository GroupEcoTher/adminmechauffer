import Home from "./pages/home/Home";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Products from "./pages/products/Products";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Menu from "./components/menu/Menu";
import Login from "./pages/login/Login";
import "./styles/global.scss";
import User from "./pages/user/User";

//users
import AideDoc from "./pages/users/AideDoc";
import HistAction from "./pages/users/HistAction";
import QuestDem from "./pages/users/QuestDem";
import RecepMail from "./pages/users/RecepMail";
import Users from "./pages/users/Users";
import UsersHome from "./pages/users/UsersHome";



//Partenaires
import Partenaires from "./pages/Partenaires/Partenaires";
import PartenairesFullLengthBox from "../../pages/Partenaires/PartenairesFullLengthBox";

//Parains
import Parains from "./pages/Parains/Parains";

import Product from "./pages/product/Product";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const Layout = () => {
    return (
      <div className="main">
        <Navbar />
        <div className="container">
          <div className="menuContainer">
            <Menu />
          </div>
          <div className="contentContainer">
            <QueryClientProvider client={queryClient}>
              <Outlet />
            </QueryClientProvider>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home title="Accueil" />,
        },
        {
          path: "/UsersHome",
          element: <UsersHome title="Gestion des utilisateurs" />,
        },
        {
          path: "/HistAction",
          element: <HistAction title="Historique des actions" />,
        },
        {
          path: "/QuestDem",
          element: <QuestDem title="Questions, demandes et litiges" />,
        },
        {
          path: "/RecepMail",
          element: <RecepMail title="Réception des mails" />,
        },
        {
          path: "/users",
          element: <Users title="Utilisateurs" />,
        },
        {
          path: "/Partenaires",
          element: <Partenaires title="Partenaires" />,
        },
        {
          path: "/Parains",
          element: <Parains title="Parrains" />,
        },
        {
          path: "/products",
          element: <Products title="Produits" />,
        },
        {
          path: "/users/:id",
          element: <User title="Détails de l'utilisateur" />,
        },
        {
          path: "/products/:id",
          element: <Product title="Détails du produit" />,
        },
        {
          path: "/AideDoc",
          element: <AideDoc title="Aide et documentation" />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login title="Connexion" />,
    },
  ]);
  
  return <RouterProvider router={router} />;
}

export default App;