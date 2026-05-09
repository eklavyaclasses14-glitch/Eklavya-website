const express = require('express');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Note    = require('../models/Note');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

// GET /api/student/:id/dashboard
router.get('/:id/dashboard', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const subjects = await Subject.find({
      department: student.department,
      semester:   student.semester,
    });

    const subjectIds = subjects.map(s => s._id);

    const recentNotes = await Note.find({ subject_id: { $in: subjectIds } })
      .populate('subject_id', 'subject_name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      student,
      subjects,
      recentNotes: recentNotes.map(n => ({
        _id:                  n._id,
        title:                n.title,
        file_type:            n.file_type,
        google_drive_file_id: n.google_drive_file_id,
        subject_name:         n.subject_id?.subject_name || '',
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/student/:id/notes
router.get('/:id/notes', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('department semester');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const subjects = await Subject.find({
      department: student.department,
      semester:   student.semester,
    });

    const subjectIds = subjects.map(s => s._id);
    const subjectMap = Object.fromEntries(subjects.map(s => [s._id.toString(), s.subject_name]));

    const notes = await Note.find({ subject_id: { $in: subjectIds } }).sort({ createdAt: -1 });

    res.json({
      notes: notes.map(n => ({
        _id:                  n._id,
        title:                n.title,
        file_type:            n.file_type,
        google_drive_file_id: n.google_drive_file_id,
        subject_name:         subjectMap[n.subject_id.toString()] || '',
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
