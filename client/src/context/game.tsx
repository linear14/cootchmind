import React, { createContext, useState } from 'react';
import { RoomGameState } from 'types/room';

interface GameStateContextDefault extends Partial<RoomGameState> {
  setGameState: (gameState: RoomGameState) => void;
}

const GameStateContext = createContext<GameStateContextDefault>({
  state: undefined,
  currentRound: undefined,
  turn: undefined,
  setGameState: (gameState: RoomGameState) => {}
});

const GameStateContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<Partial<RoomGameState>>({
    state: undefined,
    currentRound: undefined,
    turn: undefined
  });

  return (
    <GameStateContext.Provider
      value={{
        ...gameState,
        setGameState: (gameState: RoomGameState) => setGameState(gameState)
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export { GameStateContext, GameStateContextProvider };
