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
    required: true,
    index: true
  },

  file_type: {
    type: String,
    enum: ['pdf', 'image'],
    default: 'pdf'
  },

  label: {
    type: String,
    required: true,
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