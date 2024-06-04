import './config/firebase.js';
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
import ModalUsers from './components/allModal/ModalUsers';

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home title="Homepage : les stats basic et messages internes" /> },
      { path: "/UsersHome", element: <UsersHome title="Gestion - Users" /> },
      { path: "/UsersTraitements", element: <UsersTraitements title="Gestion Users - États & Traitements" /> },
      { path: "/Partenaires", element: <Partenaires title="Gestion - Partenaires" /> },
      { path: "/Parains", element: <Parains title="Gestion - Parrains" /> },
      { path: "/HistAction", element: <HistAction title="Historique des actions - Résumé d’utilisation" /> },
      { path: "/QuestDem", element: <QuestDem title="Questions - Demandes - Via Le Site" /> },
      { path: "/RecepMail", element: <RecepMail title="Réception des mails" /> },
      { path: "/products", element: <Products title="Gestion Xcp" /> },
      { path: "/users/:id", element: <User title="Détails de l'utilisateur" /> },
      { path: "/products/:id", element: <Product title="Détails du produit" /> },
      { path: "/AideDoc", element: <AideDoc title="Aide - Documentation" /> },
      { path: "/datatable", element: <DataTable title= "table"/> },
      { path: "/ModalUsers/:id", element: <ModalUsers title="Modal Users" /> },
   
      
    
    ],
  },
  { path: "/login", element: <Login title="Connexion" /> },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
