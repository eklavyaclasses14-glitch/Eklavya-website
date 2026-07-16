const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  subject_name: { type: String, required: true, trim: true },
  department:   { type: String, required: true, trim: true },
  semester:     { type: Number, required: true },
  target_audience: { 
    type: String, 
    enum: ['regular', 'ddcet'], 
    default: 'regular' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
