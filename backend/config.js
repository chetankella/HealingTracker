// Configuration file for environment variables
module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/healing-tracker',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
};
