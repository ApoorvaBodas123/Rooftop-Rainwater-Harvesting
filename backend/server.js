require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Routes
app.use('/api/assessments', require('./routes/assessments'));

// Health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Community impact stub
app.get('/api/community/impact', (req, res) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const litersPerMonth = [100,120,90,80,60,70,150,200,180,140,110,100].map(v => v * 1000);
  const collectiveLiters = litersPerMonth.reduce((a,b)=>a+b,0);
  const score = 72;
  res.json({ months, litersPerMonth, collectiveLiters, score });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Rainwater Harvesting Assessment API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
