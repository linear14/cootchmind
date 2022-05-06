import React, { createContext, useState } from 'react';
import { Player } from 'types/player';
import { RoomGameState } from 'types/room';

interface PlayerListContextDefault {
  playerList: (Player | null)[];
  setPlayerList: (playerList: (Player | null)[]) => void;
}

const PlayerListContext = createContext<PlayerListContextDefault>({
  playerList: Array.from({ length: 6 }, () => null),
  setPlayerList: (playerList: (Player | null)[]) => {}
});

const PlayerListContextProvider = ({ children }: { children: React.ReactNode }) => {
  const emptyList = Array.from({ length: 6 }, () => null);
  const [playerList, setPlayerList] = useState<(Player | null)[]>(emptyList);

  return (
    <PlayerListContext.Provider
      value={{
        playerList,
        setPlayerList: (playerList: (Player | null)[]) => setPlayerList(playerList)
      }}
    >
      {children}
    </PlayerListContext.Provider>
  );
};

export { PlayerListContext, PlayerListContextProvider };
