const express = require('express');
const Note    = require('../models/Note');
const Subject = require('../models/Subject');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.use(protect, adminOnly);

// POST /api/admin/notes
router.post('/', async (req, res) => {
  const { title, subject_id, file_type, google_drive_file_id } = req.body;
  if (!title || !subject_id || !google_drive_file_id) {
    return res.status(400).json({ error: 'title, subject_id, and google_drive_file_id are required' });
  }
  try {
    const note = await Note.create({ title, subject_id, file_type: file_type || 'pdf', google_drive_file_id });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('subject_id', 'subject_name department semester')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/notes/:id
router.put('/:id', async (req, res) => {
  const { title, file_type, google_drive_file_id } = req.body;
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, file_type, google_drive_file_id },
      { returnDocument: 'after', runValidators: true }
    ).populate('subject_id', 'subject_name department semester');
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
