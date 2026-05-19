const express = require('express');
const mongoose = require('mongoose');
const Note    = require('../models/Note');
const { protect, staffOrAdminOnly } = require('../middleware/auth');
const { cloudinary, upload } = require('../config/cloudinary');

const router = express.Router();

// All admin note routes require JWT + admin/staff role
router.use(protect, staffOrAdminOnly);

// ── POST /api/admin/notes ──────────────────────────────────────────────────
// Upload a file to Cloudinary and save metadata to DB.
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, label, subject_id, file_type } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'A file is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(subject_id)) {
      return res.status(400).json({ error: 'Invalid subject ID' });
    }

    const note = await Note.create({
      title,
      label,
      subject_id,
      file_type: file_type || 'pdf',
      fileUrl:   req.file.path,       // Cloudinary secure URL
      publicId:  req.file.filename,   // Cloudinary public ID
    });

    res.status(201).json(note);
  } catch (err) {
    console.error('[Notes] POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/notes ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { department, semester, page = 1, limit = 6 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};

    if (department === 'All') {
      // No filter needed
    } else if (department && semester) {
      const Subject = require('../models/Subject');
      const subjects = await Subject.find({ department, semester: Number(semester) });
      const subjectIds = subjects.map(s => s._id);
      query.subject_id = { $in: subjectIds };
    } else {
      return res.json({ notes: [], total: 0, pages: 0 });
    }

    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .populate('subject_id', 'subject_name department semester')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      notes,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/notes/:id ──────────────────────────────────────────────
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const { title, file_type, label } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    if (title !== undefined) note.title = title;
    if (file_type !== undefined) note.file_type = file_type;
    if (label !== undefined) note.label = label;

    // Handle new file upload
    if (req.file) {
      // Delete old file from Cloudinary
      if (note.publicId) {
        const resourceType = note.file_type === 'pdf' ? 'raw' : 'image';
        try {
          await cloudinary.uploader.destroy(note.publicId, { resource_type: resourceType });
        } catch (cloudinaryErr) {
          console.error('[Cloudinary Delete Error]:', cloudinaryErr);
        }
      }

      note.fileUrl = req.file.path;
      note.publicId = req.file.filename;
      if (!file_type) {
        note.file_type = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';
      }
    }

    await note.save();

    const populatedNote = await Note.findById(note._id).populate('subject_id', 'subject_name department semester');
    res.json(populatedNote);
  } catch (err) {
    console.error('[Notes] PUT error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/admin/notes/:id ───────────────────────────────────────────
// Delete from DB and Cloudinary
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    // Remove from Cloudinary
    if (note.publicId) {
      const resourceType = note.file_type === 'pdf' ? 'raw' : 'image';
      await cloudinary.uploader.destroy(note.publicId, { resource_type: resourceType });
    }

    await note.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error('[Notes] DELETE error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
