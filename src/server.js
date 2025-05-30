const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'yourpassword', // change this
  database: 'f1wordle',
});

// Create table if it doesn’t exist
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  )
`);

// API route to save name
app.post('/api/save-name', async (req, res) => {
  const { name } = req.body;
  if (!name || name.length > 255) {
    return res.json({ success: false });
  }

  try {
    await pool.query('INSERT INTO users (name) VALUES (?)', [name]);
    res.json({ success: true });
  } catch (err) {
    console.error('MySQL Error:', err);
    res.json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
