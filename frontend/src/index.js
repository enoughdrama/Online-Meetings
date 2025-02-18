// src/index.js
import React from 'react';import 'process/browser';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

window.addEventListener('error', function (e) {
  if (e.message.includes('process is not defined')) {
    e.preventDefault();
    console.warn('Ignored process is not defined error');
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  //<React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <CssBaseline />
        <ToastContainer position="top-right" autoClose={5009} />
        <App />
      </BrowserRouter>
    </AuthProvider>
  //</React.StrictMode>
);
