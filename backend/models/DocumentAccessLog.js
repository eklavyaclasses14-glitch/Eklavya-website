const mongoose = require('mongoose');

const DocumentAccessLogSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  note_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true,
    index: true
  },
  ip_address: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('DocumentAccessLog', DocumentAccessLogSchema);
