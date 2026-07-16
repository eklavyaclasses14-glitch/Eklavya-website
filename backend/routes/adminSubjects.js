const express = require('express');
const { body, validationResult } = require('express-validator');
const Subject = require('../models/Subject');
const { protect, staffOrAdminOnly } = require('../middleware/auth');
const router = express.Router();

router.use(protect, staffOrAdminOnly);

// GET /api/admin/subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find()
      .sort({ department: 1, semester: 1, subject_name: 1 })
      .limit(100);
    res.json(subjects);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/admin/subjects
router.post('/',
  [
    body('subject_name').trim().notEmpty().withMessage('Subject name is required').isLength({ max: 100 }).withMessage('Subject name must not exceed 100 characters'),
    body('department').trim().notEmpty().withMessage('Department is required').isLength({ max: 100 }).withMessage('Department must not exceed 100 characters'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be a number between 1 and 8')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { subject_name, department, semester, target_audience } = req.body;
    try {
      const subject = await Subject.create({
        subject_name: subject_name.trim(),
        department: department.trim(),
        semester: Number(semester),
        target_audience: target_audience || 'regular'
      });
      res.status(201).json(subject);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/admin/subjects/:id
router.delete('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
