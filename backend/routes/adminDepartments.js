const express = require('express');
const { body, validationResult } = require('express-validator');
const Department = require('../models/Department');
const { protect, staffOrAdminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/admin/departments
// Notice: We don't necessarily need 'protect' here if we want students to also fetch departments.
// But since the hook calls '/api/admin/departments', let's just make it public or student-accessible if needed.
// Actually, let's just make it public so the login page can use it, or just use protect.
// For now, let's not strictly require staffOrAdmin for GET, so Students can fetch it too if they hit this route.
router.get('/', protect, async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.use(protect, staffOrAdminOnly);

// POST /api/admin/departments
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Department name is required'),
    body('short_name').trim().notEmpty().withMessage('Short name is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const exists = await Department.findOne({ name: req.body.name });
      if (exists) return res.status(400).json({ error: 'Department already exists' });

      const dept = await Department.create({
        name: req.body.name,
        short_name: req.body.short_name
      });
      res.status(201).json(dept);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/admin/departments/:id
router.put('/:id', async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ error: 'Not found' });

    if (req.body.name) dept.name = req.body.name;
    if (req.body.short_name) dept.short_name = req.body.short_name;

    await dept.save();
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/departments/:id
router.delete('/:id', async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
