const mongoose = require('mongoose');

const ActiveSessionSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  session_id: {
    type: String,
    required: true,
  },
  tab_id: {
    type: String,
    required: true,
  },
  current_route: {
    type: String,
    default: '',
  },
  page_title: {
    type: String,
    default: '',
  },
  action: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['online', 'idle', 'viewing_document', 'watching_video', 'taking_quiz', 'offline'],
    default: 'online'
  },
  is_visible: {
    type: Boolean,
    default: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  login_time: {
    type: Date,
    default: Date.now,
  },
  last_active: {
    type: Date,
    default: Date.now,
    expires: 120 // TTL index: document will be automatically deleted after 2 minutes (120 seconds) of inactivity
  },
}, { timestamps: { updatedAt: 'updated_at', createdAt: false } });

// Compound index to quickly find a specific tab session
ActiveSessionSchema.index({ student_id: 1, session_id: 1, tab_id: 1 }, { unique: true });

module.exports = mongoose.model('ActiveSession', ActiveSessionSchema);
