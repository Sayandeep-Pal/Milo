import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => {
    const saved = localStorage.getItem('milo_user_id');
    if (saved) return saved;
    const newId = uuidv4();
    localStorage.setItem('milo_user_id', newId);
    return newId;
  });

  const [preferences, setPreferences] = useState({
    mode: 'both', // 'video', 'text', 'both'
    interests: []
  });

  return (
    <UserContext.Provider value={{ userId, preferences, setPreferences }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
