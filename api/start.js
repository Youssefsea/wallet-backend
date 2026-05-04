const express = require('express');
const app = express();
const router = require('../router');
const cors = require('cors');
require('dotenv').config();

app.use(express.json({ limit: '10kb' }));

app.use(cors());

const corsOptions = {
  origin: 'https://wallet-wep-react.vercel.app', 
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




app.use('/', router);


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});


module.exports = app;