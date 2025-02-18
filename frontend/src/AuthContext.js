import React, { createContext, useState } from 'react';

export const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Ошибка при парсинге пользователя из localStorage:', error);
      return null;
    }
  };

  const getStoredToken = () => {
    try {
      const storedToken = localStorage.getItem('token');
      return storedToken || null;
    } catch (error) {
      console.error('Ошибка при получении токена из localStorage:', error);
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', tokenData);
    } catch (error) {
      console.error('Ошибка при сохранении пользователя в localStorage:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Ошибка при удалении пользователя из localStorage:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
