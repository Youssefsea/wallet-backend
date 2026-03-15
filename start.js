const express = require('express');
const app = express();
const router = require('./router');
const cors = require('cors');
require('dotenv').config();

// Security: limit JSON body size to prevent DoS
app.use(express.json({ limit: '10kb' }));

app.use(cors());

const corsOptions = {
  origin: 'http://localhost:3000', // Adjust this to your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));


app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.removeHeader('X-Powered-By');
  next();
});



// API prefix
app.use('/', router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const port = process.env.PORT || 3333;

app.listen(port, "0.0.0.0",() => {
  console.log(`WealthWise API running at http://localhost:${port}`);
});