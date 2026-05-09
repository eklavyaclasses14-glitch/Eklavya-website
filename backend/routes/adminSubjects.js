const express = require('express');
const Subject = require('../models/Subject');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.use(protect, adminOnly);

// GET /api/admin/subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ department: 1, semester: 1, subject_name: 1 });
    res.json(subjects);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/admin/subjects
router.post('/', async (req, res) => {
  const { subject_name, department, semester } = req.body;
  if (!subject_name || !department || !semester) {
    return res.status(400).json({ error: 'subject_name, department, and semester are required' });
  }
  try {
    const subject = await Subject.create({ subject_name: subject_name.trim(), department, semester: Number(semester) });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/subjects/:id
router.delete('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
