// src/contexts/CsrfContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const CsrfContext = createContext();

export const CsrfProvider = ({ children }) => {
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    fetch('http://192.168.0.195/apick/csrf-token')
      .then(response => response.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);

  return (
    <CsrfContext.Provider value={csrfToken}>
      {children}
    </CsrfContext.Provider>
  );
};

export const useCsrfToken = () => {
  const context = useContext(CsrfContext);
  if (context === undefined) {
    throw new Error('useCsrfToken must be used within a CsrfProvider');
  }
  return context;
};
