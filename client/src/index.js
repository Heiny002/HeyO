/**
 * Application Entry Point
 * Sets up the React application with necessary providers and routing
 * 
 * This file:
 * 1. Creates the root React element
 * 2. Wraps the app with necessary providers (Auth, Router)
 * 3. Renders the application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Create root element and render the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* BrowserRouter enables routing functionality */}
    <BrowserRouter>
      {/* AuthProvider provides authentication context to the entire app */}
      <AuthProvider>
        {/* Main application component */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
); 