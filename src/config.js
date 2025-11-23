const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://mikalab.onrender.com/api'
                  : 'http://localhost:5000/api'),
  
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 
               (process.env.NODE_ENV === 'production' 
                 ? 'https://mikalab.onrender.com'
                 : 'http://localhost:5000'),
};

export default config;