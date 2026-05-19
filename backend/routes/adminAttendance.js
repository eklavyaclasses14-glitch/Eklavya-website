const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const { protect, staffOrAdminOnly } = require('../middleware/auth');
const router = express.Router();


router.use(protect, staffOrAdminOnly);

// GET /api/admin/attendance
router.get('/', async (req, res) => {
  try {
    const { student_id, subject_id } = req.query;

    const query = {};

    if (student_id) query.student_id = student_id;
    if (subject_id) query.subject_id = subject_id;

    const attendance = await Attendance.find(query)
      .populate('student_id', 'name user_id')
      .populate('subject_id', 'subject_name')
      .sort({ date: -1 })
      .limit(200);

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/attendance
router.post('/',
  [
    body('student_id').isMongoId().withMessage('Please provide a valid Student ID'),
    body('subject_id').isMongoId().withMessage('Please provide a valid Subject ID'),
    body('date').isISO8601().withMessage('Please provide a valid ISO 8601 date'),
    body('status').isIn(['Present', 'Absent']).withMessage('Status must be Present or Absent')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { student_id, subject_id, date, status } = req.body;
    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      const attendance = await Attendance.findOneAndUpdate(
        { student_id, subject_id, date: normalizedDate },
        { status },
        { upsert: true, returnDocument: 'after' }
      );
      res.status(201).json(attendance);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/admin/attendance/:id
router.delete('/:id', async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
