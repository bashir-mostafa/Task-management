// src/App.jsx
import React from 'react';
import AppRoutes from '../src/routes/AppRoutes';
import DirectionHandler from './components/DirectionHandler/DirectionHandler';
import './index.css';

function App() {
  return (
    <>
      <DirectionHandler />
      <AppRoutes />
    </>
  );
}

export default App;
