import { socket } from './socketClient';

export const notifyAccountMerge = (gameIds, oldUserIds, newUserId) => {
  // Émettre les notifications socket pour chaque partie affectée
  gameIds.forEach(gameId => {
    oldUserIds.forEach(oldUserId => {
      socket.emit('userAccountMerged', {
        gameId: gameId.toString(),
        oldUserId,
        newUserId
      });
    });
  });
}; 