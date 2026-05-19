const express = require('express');
const Fee = require('../models/Fee');
const { protect, staffOrAdminOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
router.use(protect, staffOrAdminOnly);

// ── helpers ──────────────────────────────────────────────────────────────────

/** Extract a human-readable duplicate message from a Mongo write error */
function isDuplicateError(err) {
  return err.code === 11000 || (err.writeErrors && err.writeErrors.some(e => e.code === 11000));
}

// ── GET /api/admin/fees ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate('student_id', 'name user_id department')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/admin/fees  (single) ───────────────────────────────────────────
router.post('/',
  [
    body('student_id').isMongoId().withMessage('Please provide a valid Student ID'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('amount').isNumeric().withMessage('Amount must be a numeric value'),
    body('due_date').isISO8601().withMessage('Please provide a valid ISO 8601 date'),
    body('status').optional().isIn(['Pending', 'Paid']).withMessage('Status must be Pending or Paid'),
    body('description').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { student_id, department, amount, due_date, status, description } = req.body;

    // Manual duplicate check (friendlier error than the index message)
    if (description && description.trim()) {
      const existing = await Fee.findOne({
        student_id,
        description: description.trim(),
        due_date: new Date(due_date),
      });
      if (existing) {
        return res.status(409).json({
          error: 'A fee record with the same student, description, and due date already exists.',
        });
      }
    }

    try {
      const fee = await Fee.create({ student_id, department, amount: Number(amount), due_date: new Date(due_date), status, description });
      res.status(201).json(fee);
    } catch (err) {
      if (isDuplicateError(err)) {
        return res.status(409).json({ error: 'Duplicate fee record detected.' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

// ── POST /api/admin/fees/bulk ────────────────────────────────────────────────
// Body: { student_ids, department, amount, due_date, status, description }
router.post('/bulk',
  [
    body('student_ids').isArray().withMessage('Student IDs must be an array'),
    body('student_ids.*').isMongoId().withMessage('All items in Student IDs must be valid Mongo IDs'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('amount').isNumeric().withMessage('Amount must be a numeric value'),
    body('due_date').isISO8601().withMessage('Please provide a valid ISO 8601 date'),
    body('status').optional().isIn(['Pending', 'Paid']).withMessage('Status must be Pending or Paid'),
    body('description').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { student_ids, department, amount, due_date, status = 'Pending', description } = req.body;

    // Pre-filter: remove student_ids that already have this fee
    let skipList = [];
    if (description && description.trim()) {
      const existing = await Fee.find({
        student_id: { $in: student_ids },
        description: description.trim(),
        due_date: new Date(due_date),
      }).select('student_id');
      skipList = existing.map(f => f.student_id.toString());
    }

    const toInsert = student_ids.filter(id => !skipList.includes(id.toString()));

    if (toInsert.length === 0) {
      return res.status(409).json({
        error: 'All selected students already have a fee record with this description and due date.',
      });
    }

    const docs = toInsert.map(student_id => ({
      student_id,
      department,
      amount: Number(amount),
      due_date: new Date(due_date),
      status,
      description,
    }));

  try {
    const created = await Fee.insertMany(docs, { ordered: false });
    res.status(201).json({
      message: `${created.length} fee record(s) created.${skipList.length ? ` ${skipList.length} duplicate(s) skipped.` : ''}`,
      count: created.length,
      skipped: skipList.length,
    });
  } catch (err) {
    if (err.insertedDocs) {
      // Partial success — some duplicates slipped through the pre-filter
      return res.status(207).json({
        message: `Partial success: ${err.insertedDocs.length} created, some duplicates skipped.`,
        count: err.insertedDocs.length,
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/fees/:id ──────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { department, amount, due_date, status, description, payment_date, transaction_id } = req.body;
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      { department, amount, due_date, status, description, payment_date, transaction_id },
      { new: true, runValidators: true }
    ).populate('student_id', 'name user_id');

    if (!fee) return res.status(404).json({ error: 'Fee record not found.' });
    res.json(fee);
  } catch (err) {
    if (isDuplicateError(err)) {
      return res.status(409).json({ error: 'Another fee record with the same description and due date exists for this student.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/admin/fees/:id ───────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;  