/**
 * Application Configuration
 * Contains environment-specific settings and API endpoints
 * 
 * The configuration is designed to support both development and production environments:
 * - Development: Uses local IP address for cross-device testing
 * - Production: Uses relative API path for deployment
 */

// API Configuration
const config = {
  // API URL configuration based on environment
  // In production, uses relative path for deployment flexibility
  // In development, uses local IP address to allow testing across devices on the same network
  API_URL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://192.168.0.28:5001/api'
};

export default config; 