import React from 'react';
import ReactDOM from 'react-dom/client';
import './globals.css';

// Sanitize all fetch headers to prevent ISO-8859-1 errors
const _origFetch = window.fetch;
window.fetch = function(url, opts) {
  if (opts && opts.headers) {
    const clean = {};
    const src = opts.headers instanceof Headers
      ? Object.fromEntries(opts.headers.entries())
      : Array.isArray(opts.headers)
        ? Object.fromEntries(opts.headers)
        : opts.headers;
    for (const [k, v] of Object.entries(src)) {
      clean[k] = typeof v === 'string' ? v.replace(/[^\x20-\x7E]/g, '') : v;
    }
    opts = { ...opts, headers: clean };
  }
  return _origFetch(url, opts);
};

const { default: App } = await import('./App.jsx');
const { ToastProvider } = await import('./lib/toast.jsx');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
