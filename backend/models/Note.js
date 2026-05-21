const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: function() { return !this.is_common; },
    index: true
  },

  file_type: {
    type: String,
    enum: ['pdf', 'image'],
    default: 'pdf'
  },

  label: {
    type: String,
    required: function() { return !this.is_common; },
    trim: true
  },

  is_common: {
    type: Boolean,
    default: false
  },

  exam_date: {
    type: Date
  },

  description: {
    type: String,
    trim: true
  },

  // Cloudinary storage fields
  fileUrl: {
    type: String,
    required: true,
    default: ''
  },
  publicId: {
    type: String,
    required: true,
    default: ''
  },

}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);