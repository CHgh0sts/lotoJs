"use client"
import { createContext, useState, useEffect } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [numbers, setNumbers] = useState([]);
  const [listTypeParty, setListTypeParty] = useState([]);
  const [me, setMe] = useState(null);
  const [listUsers, setListUsers] = useState([]);
  const [listCartons, setListCartons] = useState([]);
  return (
    <GlobalContext.Provider value={{
      numbers, setNumbers,
      listTypeParty, setListTypeParty,
      me, setMe,
      listUsers, setListUsers,
      listCartons, setListCartons
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
