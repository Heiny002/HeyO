import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { motion } from 'framer-motion';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Games from './pages/Games';
import BoardBuilder from './pages/BoardBuilder';
import GameBoard from './pages/GameBoard';

// Components
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isLoading } = useContext(AuthContext);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <motion.div 
      className="App min-h-screen flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={
          <>
            <Header />
            <main className="flex-grow">
              <Login />
            </main>
            <footer className="py-4 text-center text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Hey-O! Game. All rights reserved.
            </footer>
          </>
        } />
        <Route path="/register" element={
          <>
            <Header />
            <main className="flex-grow">
              <Register />
            </main>
            <footer className="py-4 text-center text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Hey-O! Game. All rights reserved.
            </footer>
          </>
        } />
        
        {/* Game Routes - Protected */}
        <Route path="/games" element={
          <ProtectedRoute>
            <Header />
            <main className="flex-grow">
              <Games />
            </main>
            <footer className="py-4 text-center text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Hey-O! Game. All rights reserved.
            </footer>
          </ProtectedRoute>
        } />
        <Route path="/board-builder" element={
          <ProtectedRoute>
            <Header />
            <main className="flex-grow">
              <BoardBuilder />
            </main>
            <footer className="py-4 text-center text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Hey-O! Game. All rights reserved.
            </footer>
          </ProtectedRoute>
        } />
        
        {/* Full Screen Game Route */}
        <Route path="/game/:id" element={
          <ProtectedRoute>
            <Header />
            <GameBoard />
          </ProtectedRoute>
        } />
        
        {/* Redirect to login by default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </motion.div>
  );
}

export default App; 