const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'yourpassword',
  database: process.env.DB_NAME || 'f1wordle',
});

// Serve f1.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/f1.html'));
});

app.post('/api/save-name', async (req, res) => {
  const { name } = req.body;
  if (!name || name.length > 255) return res.json({ success: false });

  try {
    await pool.query('INSERT INTO users (name) VALUES (?)', [name]);
    res.json({ success: true });
  } catch (err) {
    console.error('MySQL Error:', err);
    res.json({ success: false });
  }
});

module.exports = app;
