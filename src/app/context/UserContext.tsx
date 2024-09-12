"use client";

import { createContext, useContext, useState } from "react";

type UserInfo = {
  name: string;
  role: "Student" | "Professor" | null;
};

const emptyUser: UserInfo = {
  name: "",
  role: null,
};

const AppContext = createContext<any>(undefined);

export function AppWrapper({ children }: { children: React.ReactNode }) {
  let [userInfo, setUserInfo] = useState<UserInfo>(emptyUser);

  return (
    <AppContext.Provider
      value={{
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
