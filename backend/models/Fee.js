const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    department: {
      type: String,
      trim: true,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paid_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    due_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Partial Paid', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    description: {
      type: String,
      trim: true,
    },
    payment_date: {
      type: Date,
    },
    transaction_id: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// ── Duplicate guard ──────────────────────────────────────────────────────────
// Strict 1 fee per semester rule
FeeSchema.index(
  { student_id: 1, semester: 1 },
  { unique: true, name: 'unique_student_semester' }
);

module.exports = mongoose.model('Fees', FeeSchema);