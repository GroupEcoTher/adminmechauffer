const express = require('express');
const path = require('path');
const app = express();

// Servir les fichiers statiques de votre répertoire 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

// Pour toutes les autres routes, renvoyer 'index.html' afin que l'application puisse gérer la navigation côté client
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
