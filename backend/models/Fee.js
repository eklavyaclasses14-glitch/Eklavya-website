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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    due_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
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
// A student cannot have two fee records with the exact same description AND
// due_date. This covers both single and bulk inserts.
// Use a partial/sparse index so records without a description are still allowed
// to have multiple entries (only non-null description combos are unique).
FeeSchema.index(
  { student_id: 1, description: 1, due_date: 1 },
  {
    unique: true,
    partialFilterExpression: {
      description: { $type: 'string', $gt: '' }, // only enforce when description is filled
    },
    name: 'unique_student_description_duedate',
  }
);

module.exports = mongoose.model('Fees', FeeSchema);