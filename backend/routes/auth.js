const express = require('express');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const Student = require('../models/Student');
const router  = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { enrollment_no, password } = req.body;

  // ── Admin hardcoded login ──
  if (enrollment_no === 'admin' && password === 'admin') {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({
      token,
      role: 'admin',
      user: { name: 'Administrator', email: 'admin@eklavya.edu' },
    });
  }

  // ── Student login ──
  try {
    const student = await Student.findOne({
      $or: [{ user_id: enrollment_no }, { enrollment_no }],
    });

    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials. Check your User ID and password.' });
    }

    const match = await student.matchPassword(password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials. Check your User ID and password.' });
    }

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const { password: _, ...safe } = student.toObject();
    res.json({ token, role: 'student', user: safe });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
