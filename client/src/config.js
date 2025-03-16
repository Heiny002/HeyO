// API Configuration
const config = {
  // Use the local IP address for development to allow testing across devices
  API_URL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://192.168.0.28:5001/api'
};

export default config; 