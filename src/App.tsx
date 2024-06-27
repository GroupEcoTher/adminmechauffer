// src/App.tsx

import './config/firebase.jsx';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Menu from "./components/menu/Menu";
import Home from "./pages/home/Home";
import Products from "./pages/products/Products";
import Login from "./pages/login/Login";
import User from "./pages/user/User";
import AideDoc from "./pages/users/AideDoc";
import HistAction from "./pages/users/HistAction";
import QuestDem from "./pages/users/QuestDem";
import RecepMail from "./pages/users/RecepMail";
import UsersTraitements from "./pages/users/UsersTraitements"; 
import UsersHome from "./pages/users/UsersHome";
import Partenaires from "./pages/Partenaires/Partenaires";
import Parains from "./pages/Parains/Parains";
import Product from "./pages/product/Product";
import "./styles/global.scss";
import DataTable from './components/dataTable/DataTable';
import ModalUsers from './components/allModal/ModalUsers.tsx';

const queryClient = new QueryClient();

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

interface WrapperComponentProps {
  Component: React.FC<any>;
  componentProps: any;
}


//WrapperComponent : Ce composant enveloppe un composant de route et injecte les props supplémentaires nécessaires.
const WrapperComponent: React.FC<WrapperComponentProps> = ({ Component, componentProps }) => { 
  return <Component {...componentProps} />;
};



const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <WrapperComponent Component={Home} componentProps={{ title: "Homepage : les stats basic et messages internes" }} /> },

      // Menu gauche
      { path: "/Partenaires", element: <WrapperComponent Component={Partenaires} componentProps={{ title: "Gestion - Partenaires" }} /> },
      { path: "/Parains", element: <WrapperComponent Component={Parains} componentProps={{ title: "Gestion - Parrains" }} /> },
      { path: "/products", element: <WrapperComponent Component={Products} componentProps={{ title: "Gestion Xcp" }} /> },

      // Users 
      { path: "/UsersHome", element: <WrapperComponent Component={UsersHome} componentProps={{ title: "Accueil des utilisateurs" }} /> },
      { path: "/UsersTraitements", element: <WrapperComponent Component={UsersTraitements} componentProps={{ title: "Gestion Users - États & Traitements" }} /> },
     
      //Menu FullenghtBox
      { path: "/HistAction", element: <WrapperComponent Component={HistAction} componentProps={{ title: "Historique des actions - Résumé d’utilisation" }} /> },
      { path: "/RecepMail", element: <WrapperComponent Component={RecepMail} componentProps={{ title: "Réception des mails" }} /> },
      { path: "/QuestDem", element: <WrapperComponent Component={QuestDem} componentProps={{ title: "Questions - Demandes - Via Le Site" }} /> },
      { path: "/AideDoc", element: <WrapperComponent Component={AideDoc} componentProps={{ title: "Aide - Documentation" }} /> },

      // BY ID
      { path: "/users/:id", element: <WrapperComponent Component={User} componentProps={{ title: "Détails de l'utilisateur" }} /> },
      { path: "/ModalUsers/:id", element: <WrapperComponent Component={ModalUsers} componentProps={{ title: "Modal Users" }} /> },
      { path: "/products/:id", element: <WrapperComponent Component={Product} componentProps={{ title: "Détails du produit" }} /> },
      
      // MODULES
      { path: "/datatable", element: <WrapperComponent Component={DataTable} componentProps={{ title: "table", slug: "data-slug", rows: [], columns: [] }} /> },
    ],
  },
  { path: "/login", element: <WrapperComponent Component={Login} componentProps={{ title: "Connexion" }} /> },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
