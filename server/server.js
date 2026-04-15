require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/streak', require('./routes/streakRoutes'));
app.use('/api/cycle', require('./routes/cycleRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/targets', require('./routes/targetRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
