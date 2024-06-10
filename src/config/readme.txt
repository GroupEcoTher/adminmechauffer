Dans le fichier src/config/firebase.js, plusieurs fonctions sont définies pour interagir avec une base de données Firebase. Voici une liste organisée par thèmes :

Initialisation et configuration de Firebase :

Initialisation de l'application Firebase avec initializeApp(firebaseConfig).
Initialisation d'une deuxième instance de l'application avec initializeApp(firebaseConfig, 'Secondary').
Configuration de l'authentification avec getAuth(app) et getAuth(appSecond).
Configuration du stockage avec getStorage(app).
Configuration de la base de données Firestore avec getFirestore(app).
Fonctions pour récupérer des données :

getData : Récupère tous les utilisateurs de la collection "users" qui n'ont pas de données supplémentaires.
getDataAdressebyUserID : Récupère les adresses associées à un utilisateur spécifique.
getDataDemandesbyUserID : Récupère les demandes associées à un utilisateur spécifique, triées par date de création.
getDataDemandesbyAddresseID : Récupère les demandes associées à une adresse spécifique.
getUserParrainbyTokenID, getParrainbyTokenID, et getTempXcpByTokenID : Récupèrent des informations spécifiques basées sur un Token donné.
Fonctions pour créer et mettre à jour des données :

createUserDocument : Crée un nouveau document utilisateur avec des données supplémentaires.
adduserlisttoparrain : Ajoute un utilisateur à la liste des utilisateurs d'un parrain.
Ces fonctions utilisent diverses méthodes Firestore pour interagir avec la base de données, y compris getDocs, query, where, orderBy, setDoc, updateDoc, doc, collection, et d'autres.



XCP
- DROIT 1
- DROIT 2

ACCES 1
ACCES 2

80 %
40 %