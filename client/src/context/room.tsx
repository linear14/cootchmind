import React, { createContext, useState } from 'react';
import { RoomDataImmutable } from 'types/room';

interface RoomContextDefault extends Partial<RoomDataImmutable> {
  setRoom: (room: RoomDataImmutable) => void;
}

const RoomContext = createContext<RoomContextDefault>({
  roomId: undefined,
  title: undefined,
  master: undefined,
  setRoom: (room: RoomDataImmutable) => {}
});

const RoomContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [room, setRoom] = useState<Partial<RoomDataImmutable>>();

  return (
    <RoomContext.Provider
      value={{
        ...room,
        setRoom: (room: RoomDataImmutable) => setRoom(room)
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export { RoomContext, RoomContextProvider };
