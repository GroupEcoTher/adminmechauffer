# Guide d'Utilisation de UsersTraitements

Ce document décrit le fonctionnement et les fonctionnalités du composant `UsersTraitements` utilisé pour la gestion des utilisateurs dans l'application.

## Fonctionnalités Principales

1. **Affichage des Utilisateurs**
   - Affiche une liste des utilisateurs avec diverses informations telles que l'ID, le prénom, le nom, l'email, le téléphone, et la date de création.

2. **Gestion des Documents**
   - Affiche des boutons pour voir les documents d'identité et les avis d'imposition.
   - Permet de vérifier ou de marquer comme non conforme les documents avec des cases à cocher.

3. **Statut de Vérification**
   - Un champ `Vérifiée` indique si tous les documents de l'utilisateur sont vérifiés.

4. **Archivage des Utilisateurs**
   - Une colonne `Archivée` indique si un utilisateur est archivé avec un rond rouge.
   - Les utilisateurs archivés sont affichés avec une ligne en couleur orange.
   - Le bouton "Unarchive" est disponible (commenté dans le code) pour désarchiver un utilisateur.

## Structure du Composant

- `useEffect` pour récupérer les données des utilisateurs à partir de Firebase.
- Trois boutons pour filtrer les utilisateurs : tous les utilisateurs, utilisateurs incomplets, et utilisateurs non conformes.
- Une grille de données (DataGrid) pour afficher les informations des utilisateurs.

## Champs et Colonnes

- **ID** : Affiche l'ID de l'utilisateur et ouvre un modal avec plus de détails lorsqu'on clique dessus.
- **First name** : Prénom de l'utilisateur.
- **Last name** : Nom de l'utilisateur.
- **Email** : Adresse email de l'utilisateur.
- **Phone** : Numéro de téléphone de l'utilisateur.
- **Created At** : Date de création du compte utilisateur.
- **Pièce Identité** : Affiche un bouton pour voir le document et des cases à cocher pour vérifier ou marquer comme non conforme.
- **Avis D'impôts** : Fonctionne de manière similaire à la `Pièce Identité`.
- **Vérifiée** : Indique si tous les documents de l'utilisateur sont vérifiés.
- **Archivée** : Indique si l'utilisateur est archivé avec un rond rouge et une option pour désarchiver (bouton commenté).

## Instructions d'Installation

1. **Prérequis**
   - Node.js
   - Firebase

2. **Installation**
   - Clonez le dépôt.
   - Installez les dépendances avec `npm install`.

3. **Configuration**
   - Configurez Firebase avec vos informations d'authentification.

4. **Lancer l'application**
   - Démarrez l'application avec `npm start`.

## Note Importante

Les fonctionnalités de désarchivage sont actuellement commentées. Pour les activer, décommentez les lignes appropriées dans la colonne `Archivée` dans le fichier `UsersTraitements.tsx`.

Pour toute question ou aide supplémentaire, consultez la documentation ou contactez l'équipe de développement.
