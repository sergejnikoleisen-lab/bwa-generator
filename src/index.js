import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Impressum from './Impressum';
import AGB from './AGB';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Impressum />} />
        <Route path="/agb" element={<AGB />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
