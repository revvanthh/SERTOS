import React from 'react';
import { SertosProvider } from './context/SertosContext';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <SertosProvider>
      <AppRouter />
    </SertosProvider>
  );
}
