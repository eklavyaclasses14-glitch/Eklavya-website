// models/Staff.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, default: '' },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['staff', 'admin'], default: 'staff' },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },
}, { timestamps: true });

StaffSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

StaffSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Staff', StaffSchema);