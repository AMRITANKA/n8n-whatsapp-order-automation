const express = require('express');
const router = express.Router();
const db = require('../database/init');

// Get all customers
router.get('/', (req, res) => {
  db.all('SELECT * FROM customers ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get customer by phone number
router.get('/phone/:phone', (req, res) => {
  const phoneNumber = req.params.phone;
  
  db.get('SELECT * FROM customers WHERE phone_number = ?', [phoneNumber], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || null);
  });
});

// Create or update customer
router.post('/', (req, res) => {
  const { phone_number, name, email, address } = req.body;
  
  if (!phone_number) {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }

  db.run(`
    INSERT OR REPLACE INTO customers (phone_number, name, email, address, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [phone_number, name, email, address], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      id: this.lastID,
      phone_number,
      message: 'Customer created/updated successfully'
    });
  });
});

module.exports = router;