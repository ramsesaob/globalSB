// MSALProvider.js
import React, { useState, useEffect, createContext } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../MSAL';

const MSALContext = createContext();

export const MSALProvider = ({ children }) => {
  const [msalInstance, setMsalInstance] = useState(null);

  useEffect(() => {
    const msal = new PublicClientApplication(msalConfig);
    msal.initialize().then(() => {
      setMsalInstance(msal);
    }).catch(err => {
      console.error('Error initializing MSAL', err);
    });
  }, []);

  return (
    <MSALContext.Provider value={msalInstance}>
      {children}
    </MSALContext.Provider>
  );
};

export const useMSAL = () => {
  const context = React.useContext(MSALContext);
  if (!context) {
    throw new Error("useMSAL must be used within a MSALProvider");
  }
  return context;
};
