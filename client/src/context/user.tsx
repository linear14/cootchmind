import React, { createContext, useState } from 'react';
import { User } from 'types/user';

interface UserContextDefault extends User {
  setName: (name?: string) => void;
}
const UserContext = createContext<UserContextDefault>({
  name: undefined,
  setName: (name?: string) => {}
});

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [name, setName] = useState<string>();
  return (
    <UserContext.Provider
      value={{
        name,
        setName: (name?: string) => setName(name)
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
