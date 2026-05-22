const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  user_id:         { type: String, required: true, unique: true, trim: true },
  email:           { type: String, required: true, unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] },   // kept for backward compat
  password:        { type: String, required: true, select: false },
  department:      { type: String, default: 'Computer Engineering', trim: true, index: true },
  semester:        { type: Number, default: 1, index: true },
  student_contact: { type: String, default: '' },
  parent_contact:  { type: String, default: '' },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },
  sessionToken: { type: String, select: false },
  sessionExpiresAt: { type: Date, select: false },
}, { timestamps: true });

// Hash password before saving
StudentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare plain password with hash
StudentSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);
