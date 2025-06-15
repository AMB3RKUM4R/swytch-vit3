// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// ✅ use this
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    
      <BrowserRouter>
        <App />
      </BrowserRouter>
    
  </StrictMode>
);
