require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err);
  } else {
    console.log('Connected to MySQL database.');
  }
});

// API to Add Employees
app.post('/api/employees', (req, res) => {
  const { name, employeeId, email, phoneNumber, department, dateOfJoining, role } = req.body;

  // Validate input
  if (!name || !employeeId || !email || !phoneNumber || !department || !dateOfJoining || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  if (!/^\d{10}$/.test(phoneNumber)) {
    return res.status(400).json({ message: 'Phone number must be 10 digits.' });
  }

  if (new Date(dateOfJoining) > new Date()) {
    return res.status(400).json({ message: 'Date of Joining cannot be in the future.' });
  }

  // Check if employee already exists
  const checkQuery = `SELECT * FROM employees WHERE employeeId = ? OR email = ?`;
  db.query(checkQuery, [employeeId, email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error.', error: err });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Employee ID or Email already exists.' });
    }

    const insertQuery = `INSERT INTO employees (name, employeeId, email, phoneNumber, department, dateOfJoining, role) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(insertQuery, [name, employeeId, email, phoneNumber, department, dateOfJoining, role], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Database error.', error: err });
      }

      res.status(201).json({ message: 'Employee added successfully.' });
    });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
