const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  user_id:         { type: String, required: true, unique: true, trim: true },
  enrollment_no:   { type: String, trim: true },   // kept for backward compat
  password:        { type: String, required: true },
  department:      { type: String, default: 'Computer Engineering' },
  semester:        { type: Number, default: 1 },
  student_contact: { type: String, default: '' },
  parent_contact:  { type: String, default: '' },
}, { timestamps: true });

// Hash password before saving
StudentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare plain password with hash
StudentSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);
