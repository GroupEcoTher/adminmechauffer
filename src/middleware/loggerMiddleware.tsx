// src/loggerMiddleware.ts
import axios from 'axios';

const logAttempt = async (url: string) => {
  const logData = {
    ip: 'Unknown', // L'adresse IP ne peut pas être facilement obtenue côté client sans un serveur
    date: new Date().toISOString(),
    url: url,
    user: 'Guest',
  };

  try {
    // Changez l'URL à celle de votre serveur de journalisation lorsque vous en aurez un
    await axios.post('https://your-logging-server.com/log', logData);
  } catch (error) {
    console.error('Error logging attempt:', error);
  }
};

export default logAttempt;