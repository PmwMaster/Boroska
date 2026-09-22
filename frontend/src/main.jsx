import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ToastProvider } from './lib/toast.jsx';
import './globals.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
