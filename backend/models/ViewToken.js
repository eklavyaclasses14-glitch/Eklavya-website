const mongoose = require('mongoose');

const ViewTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  note_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 // TTL index: document will be automatically deleted after 30 seconds
  }
});

module.exports = mongoose.model('ViewToken', ViewTokenSchema);
