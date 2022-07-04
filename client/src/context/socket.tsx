import React, { createContext } from 'react';
import { io, Socket } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SERVER_ORIGIN || 'http://localhost:4000');
// const socket = io('http://localhost:4000');

export const SocketContext = createContext<Socket>(socket);

const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export default SocketContextProvider;
