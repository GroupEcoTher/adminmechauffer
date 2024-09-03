import { Navigate } from 'react-router-dom';
import ModalUsers from './components/allModal/modalUsers';
import React from 'react';
import './config/firebase'; // Initialisation de Firebase pour la gestion de l'authentification et des données
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/navbar/Navbar"; // Composant pour la barre de navigation
import Footer from "./components/footer/Footer"; // Composant pour le pied de page
import Menu from "./components/menu/Menu"; // Composant pour le menu latéral
import Home from "./pages/home/Home";

import products from './pages/products/allproducts';

import Login from "./pages/login/Login";
import User from "./pages/user/User"; // Page de détails de l'utilisateur
import AideDoc from "./pages/users/AideDoc"; // Page d'aide et documentation
import HistAction from "./pages/users/HistAction"; // Page d'historique des actions
import QuestDem from "./pages/users/QuestDem"; // Page de questions et demandes
import RecepMail from "./pages/users/RecepMail"; // Page de réception des mails
import UsersTraitements from "./pages/users/UsersTraitements"; // Page de traitement des utilisateurs
import UsersHome from "./pages/users/UsersHome"; // Page d'accueil des utilisateurs
import Partenaires from "./pages/Partenaires/Partenaires"; // Page de gestion des partenaires
import Parains from "./pages/Parains/Parains"; // Page de gestion des parrains
import product from "./pages/product/productsimple"; // Page de détails d'un produit  
import "./styles/global.scss"; // Importation des styles globaux de l'application
import DataTable from './components/dataTable/DataTable'; // Composant de tableau de données
import PrivateRoute from './components/PrivateRoute'; // Composant pour protéger les routes privées
import { UserAdminProvider } from './components/UserAdminContext'; // Contexte pour gérer l'état d'authentification de l'utilisateur
import ErrorBoundary from './components/ErrorBoundary'; // Importer le composant de gestion des erreurs

const queryClient = new QueryClient(); // Configure et gère les requêtes réseau et le cache de données de l'application

// Composant Layout pour encapsuler la structure principale de l'application
const Layout = () => (
  <div className="main">
    <Navbar /> {/* La barre de navigation en haut de la page */}
    <div className="container">
      <div className="menuContainer">
        <Menu /> {/* Le menu latéral pour la navigation */}
      </div>
      <div className="contentContainer">
        {/* Provider pour React Query, permettant de gérer les requêtes et le cache */}
        <QueryClientProvider client={queryClient}>
          <Outlet /> {/* Rendu dynamique des composants enfants définis dans les routes */}
        </QueryClientProvider>
      </div>
    </div>
    <Footer /> {/* Le pied de page */}
  </div>
);

interface WrapperComponentProps {
  Component: React.FC<any>;
  componentProps: any;
}

// Composant Wrapper pour permettre le passage des props spécifiques aux composants des routes
const WrapperComponent: React.FC<WrapperComponentProps> = ({ Component, componentProps }) => (
  <Component {...componentProps} />
);

// Définition des routes avec React Router
// Utilisation de createBrowserRouter pour configurer la navigation
const router = createBrowserRouter([
  {
    path: "/login",

    // Route pour la page de connexion
    element: <WrapperComponent Component={Login} componentProps={{ title: "Connexion" }} />,
  },
  {
    path: "/",
    // Route pour les pages protégées, nécessitant une authentification
    element: <PrivateRoute><Layout /></PrivateRoute>,
    children: [
      // Définition des routes enfants qui seront rendues dans l'Outlet du Layout
      { path: "", element: <WrapperComponent Component={Home} componentProps={{ title: "Homepage : les stats basic et messages internes" }} /> },
      { path: "Partenaires", element: <WrapperComponent Component={Partenaires} componentProps={{ title: "Gestion - Partenaires" }} /> },
      { path: "Parains", element: <WrapperComponent Component={Parains} componentProps={{ title: "Gestion - Parrains" }} /> },
      { path: "products", element: <WrapperComponent Component={products} componentProps={{ title: "Gestion Xcp" }} /> },
      { path: "UsersHome", element: <WrapperComponent Component={UsersHome} componentProps={{ title: "Accueil des utilisateurs" }} /> },
      { path: "UsersTraitements", element: <WrapperComponent Component={UsersTraitements} componentProps={{ title: "Gestion Users - États & Traitements" }} /> },
      { path: "HistAction", element: <WrapperComponent Component={HistAction} componentProps={{ title: "Historique des actions - Résumé d’utilisation" }} /> },
      { path: "RecepMail", element: <WrapperComponent Component={RecepMail} componentProps={{ title: "Réception des mails" }} /> },
      { path: "QuestDem", element: <WrapperComponent Component={QuestDem} componentProps={{ title: "Questions - Demandes - Via Le Site" }} /> },
      { path: "AideDoc", element: <WrapperComponent Component={AideDoc} componentProps={{ title: "Aide - Documentation" }} /> },
      { path: "users/:id", element: <WrapperComponent Component={User} componentProps={{ title: "Détails de l'utilisateur" }} /> },
      { path: "ModalUsers/:id", element: <WrapperComponent Component={ModalUsers} componentProps={{ title: "Modal Users" }} /> },
      { path: "ModalUsers/", element: <WrapperComponent Component={ModalUsers} componentProps={{ title: "Modal Users" }} /> },
      { path: "products/:id", element: <WrapperComponent Component={product} componentProps={{ title: "Détails du produit" }} /> },
      { path: "datatable", element: <WrapperComponent Component={DataTable} componentProps={{ title: "table", slug: "data-slug", rows: [], columns: [] }} /> },
      { path: "*", element: <Navigate to="/login" /> },
    ],
  },
]);

// Composant principal de l'application
// Il est enveloppé avec UserAdminProvider pour fournir le contexte utilisateur à toute l'application
// Et avec ErrorBoundary pour gérer les erreurs de manière conviviale
const App = () => (
  <UserAdminProvider>
    <ErrorBoundary>
    <RouterProvider router={router} />
    </ErrorBoundary>
  </UserAdminProvider>
);

export default App;