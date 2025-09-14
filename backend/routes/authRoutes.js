const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const user = await prisma.user.create({
      data: { name, email, password, role }, // store plain password
    });

    res.status(201).json({ message: 'User registered', user });
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request body:', req.body);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User found in DB:', user);

    if (!user) return res.status(400).json({ error: 'User not found' });

    if (user.password !== password) {
      console.log('Password comparison result: false');
      return res.status(401).json({ error: 'Invalid password' });
    }
    console.log('Password comparison result: true');

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
