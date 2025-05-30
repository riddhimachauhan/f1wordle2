const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Create MySQL connection pool
// ⚠️ Make sure to set these environment variables in your Vercel dashboard or hosting platform
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',       // Change 'localhost' for production DB host
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'yourpassword',
  database: process.env.DB_NAME || 'f1wordle',
});

// Serve the static f1.html file on the root route '/'
// Make sure f1.html is inside 'public' folder located one level above this file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/f1.html'));
});

// API route to save name
app.post('/api/save-name', async (req, res) => {
  const { name } = req.body;

  // Validate input
  if (!name || name.length > 255) return res.json({ success: false });

  try {
    await pool.query('INSERT INTO users (name) VALUES (?)', [name]);
    res.json({ success: true });
  } catch (err) {
    console.error('MySQL Error:', err);
    res.json({ success: false });
  }
});

// -- Important --
// If you want to serve other static assets (CSS, JS, images), uncomment this line:
// app.use(express.static(path.join(__dirname, '../public')));

// -- Vercel serverless expects no listen() here --
// Export the app so Vercel can handle the server
module.exports = app;
