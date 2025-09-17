module.exports = {
    // MongoDB Configuration
    mongoURI: process.env.MONGODB_URI,
    
    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE,
    jwtCookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE, 10),
    
    // Server Configuration
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    
    // Frontend URL for CORS
    frontendUrl: process.env.FRONTEND_URL
  };