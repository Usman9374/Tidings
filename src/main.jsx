import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// The chrome faces load up front; the letter fonts load on demand (fonts.js).
import '@fontsource/abril-fatface/latin-400.css';
import '@fontsource/libre-franklin/latin-600.css';
import '@fontsource/libre-franklin/latin-700.css';
import './styles/tokens.css';
import './styles/app.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
