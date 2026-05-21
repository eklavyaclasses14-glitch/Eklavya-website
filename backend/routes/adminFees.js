const express = require('express');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { protect, staffOrAdminOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
router.use(protect, staffOrAdminOnly);

// ── helpers ──────────────────────────────────────────────────────────────────

function isDuplicateError(err) {
  return err.code === 11000 || (err.writeErrors && err.writeErrors.some(e => e.code === 11000));
}

// ── GET /api/admin/fees ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate('student_id', 'name user_id department semester')
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
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester is required'),
    body('amount').isNumeric().withMessage('Amount must be a numeric value'),
    body('due_date').isISO8601().withMessage('Please provide a valid ISO 8601 date'),
    body('description').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { student_id, department, semester, amount, due_date, description } = req.body;

    const existing = await Fee.findOne({ student_id, semester });
    if (existing) {
      return res.status(409).json({
        error: 'A fee record for this student and semester already exists.',
      });
    }

    try {
      const fee = await Fee.create({ 
        student_id, 
        department, 
        semester, 
        amount: Number(amount), 
        paid_amount: 0, 
        due_date: new Date(due_date), 
        status: 'Pending', 
        description 
      });
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
// Body: { department, semester, amount, due_date, description }
router.post('/bulk',
  [
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester is required'),
    body('amount').isNumeric().withMessage('Amount must be a numeric value'),
    body('due_date').isISO8601().withMessage('Please provide a valid ISO 8601 date'),
    body('description').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { department, semester, amount, due_date, description } = req.body;

    // Strict 1 fee rule check
    const existingRule = await Fee.findOne({ department, semester });
    if (existingRule) {
      return res.status(409).json({
        error: 'Fees rule already exists for this department and semester.',
      });
    }

    try {
      const students = await Student.find({ department, semester }).select('_id');
      if (students.length === 0) {
        return res.status(404).json({ error: 'No students found for this department and semester.' });
      }

      const docs = students.map(s => ({
        student_id: s._id,
        department,
        semester,
        amount: Number(amount),
        paid_amount: 0,
        due_date: new Date(due_date),
        status: 'Pending',
        description,
      }));

      const created = await Fee.insertMany(docs, { ordered: false });
      res.status(201).json({
        message: `${created.length} fee record(s) created for ${department} Sem ${semester}.`,
        count: created.length,
      });
    } catch (err) {
      if (err.insertedDocs) {
        return res.status(207).json({
          message: `Partial success: ${err.insertedDocs.length} created.`,
          count: err.insertedDocs.length,
        });
      }
      res.status(500).json({ error: err.message });
    }
});

// ── PUT /api/admin/fees/:id ──────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const existing = await Fee.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Fee record not found.' });

    const updates = { ...req.body };
    const totalAmt = updates.amount !== undefined ? Number(updates.amount) : existing.amount;
    const paidAmt = updates.paid_amount !== undefined ? Number(updates.paid_amount) : existing.paid_amount;

    let calculatedStatus = updates.status || existing.status;
    if (paidAmt >= totalAmt && totalAmt > 0) {
      calculatedStatus = 'Paid';
    } else if (paidAmt > 0 && paidAmt < totalAmt) {
      calculatedStatus = 'Partial Paid';
    } else if (paidAmt === 0) {
      calculatedStatus = 'Pending';
    }

    updates.amount = totalAmt;
    updates.paid_amount = paidAmt;
    updates.status = calculatedStatus;

    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('student_id', 'name user_id');

    res.json(fee);
  } catch (err) {
    if (isDuplicateError(err)) {
      return res.status(409).json({ error: 'Another fee record for this student and semester already exists.' });
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