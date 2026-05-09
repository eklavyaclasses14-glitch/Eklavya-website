const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title:                { type: String, required: true, trim: true },
  subject_id:           { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  file_type:            { type: String, enum: ['pdf', 'image'], default: 'pdf' },
  google_drive_file_id: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
