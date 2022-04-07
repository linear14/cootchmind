export const getUser = () => {
  const playerName = localStorage.getItem('player-name');
  const uuid = localStorage.getItem('uuid');

  return [playerName, uuid];
};
