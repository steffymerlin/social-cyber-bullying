import React, { createContext, useState, useContext } from "react";

// Create Notification Context
const NotificationContext = createContext();

// Provider Component
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const addNotification = (message, userName) => {
    setNotification({ message, userName });
  };

  return (
    <NotificationContext.Provider value={{ notification, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => useContext(NotificationContext);
