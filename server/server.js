const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDB } = require('./config/db');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const resultRoutes = require('./routes/resultRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IELTS Prep Platform API Server is running smoothly.' });
});

// Serve static frontend (built React app) in production
const clientDistPath = path.join(__dirname, '../client/dist');
if (require('fs').existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // For any non-API route, return the React app (SPA fallback)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Initialize database tables and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 IELTS Prep API Server running on port ${PORT}`);
    console.log(`===================================================`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
});
