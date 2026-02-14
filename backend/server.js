const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healing-tracker';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error(`MongoDB connection error:', err);
    
    console.log(' Server will continue running without database connection');
  });


app.get('/', (req, res) => {
  res.json({ 
    message: 'Healing Tracker API',
    status: 'Server Running',
    timestamp: new Date().toISOString()
  });
});


app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  res.json({ 
    status: 'Backend Running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});


app.get('/api/users', (req, res) => {
  res.json({ 
    message: 'Users endpoint',
    users: [],
    count: 0
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});


app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
