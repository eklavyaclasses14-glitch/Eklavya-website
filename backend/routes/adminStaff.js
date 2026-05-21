// routes/adminStaff.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Staff = require('../models/Staff');
const { protect, staffOrAdminOnly, adminOnly } = require('../middleware/auth');
const { accountCreationLimiter } = require('../middleware/rateLimiters');

const router = express.Router();
router.use(protect, staffOrAdminOnly);

// GET all staff
router.get('/', async (req, res) => {
  const staff = await Staff.find().select('-password');
  res.json(staff);
});

// CREATE staff
router.post('/',
  adminOnly,
  accountCreationLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password, contact } = req.body;

    const exists = await Staff.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Staff already exists' });

    const staff = await Staff.create({ name, email, password, contact });
    res.status(201).json(staff);
  }
);

// DELETE staff
router.delete('/:id', adminOnly, async (req, res) => {
  await Staff.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;