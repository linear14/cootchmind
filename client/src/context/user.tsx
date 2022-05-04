import React, { createContext, useState } from 'react';
import { User } from 'types/user';

interface UserContextDefault extends User {
  setUser: (user: User) => void;
}
const UserContext = createContext<UserContextDefault>({
  uuid: undefined,
  playerName: undefined,
  setUser: (user: User) => {}
});

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>({ uuid: undefined, playerName: undefined });
  return (
    <UserContext.Provider
      value={{
        ...user,
        setUser: (user: User) => setUser(user)
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
