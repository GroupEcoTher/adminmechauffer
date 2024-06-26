// src/utils.ts

export const formatFirebaseTimestamp = (firebaseTimestamp: { seconds: number, nanoseconds: number }): Date | null => {
    if (firebaseTimestamp && typeof firebaseTimestamp.seconds === 'number' && typeof firebaseTimestamp.nanoseconds === 'number') {
      return new Date(firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1000000);
    }
    return null;
  };
  