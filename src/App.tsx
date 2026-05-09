import React from 'react';
import Toolbar from './components/Toolbar/Toolbar';
import CanvasBoard from './components/Canvas/CanvasBoard';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './styles/index.css';

const App: React.FC = () => {
  useKeyboardShortcuts();

  return (
    <main className="app">
      <Toolbar />
      <CanvasBoard />
    </main>
  );
};

export default App;
