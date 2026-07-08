const express = require('express');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Note = require('../models/Note');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const { protect, enforceStudentOwnership } = require('../middleware/auth');
const https = require('https');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const Jimp = require('jimp');
const rateLimit = require('express-rate-limit');
const DocumentAccessLog = require('../models/DocumentAccessLog');
const crypto = require('crypto');
const ViewToken = require('../models/ViewToken');

const viewRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

const router = express.Router();

router.use(protect);

// GET /api/student/:id/dashboard
router.get('/:id/dashboard', enforceStudentOwnership, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const subjects = await Subject.find({
      department: student.department,
      semester: student.semester,
    });

    const subjectIds = subjects.map(s => s._id);

    const recentNotes = await Note.find({ 
      $or: [
        { subject_id: { $in: subjectIds } },
        { is_common: true }
      ]
    })
      .populate('subject_id', 'subject_name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch attendance for summary
    const attendanceRecords = await Attendance.find({ student_id: req.params.id });
    const attendanceSummary = subjects.map(sub => {
      const subLogs = attendanceRecords.filter(a => a.subject_id.toString() === sub._id.toString());
      const present = subLogs.filter(a => a.status === 'Present').length;
      const total = subLogs.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return {
        _id: sub._id,
        subject_name: sub.subject_name,
        percentage
      };
    });

    // Fetch fee summary
    const fees = await Fee.find({ student_id: req.params.id });
    const pendingFees = fees.filter(f => f.status !== 'Paid').reduce((sum, f) => {
      const amt = f.amount || 0;
      const paid = f.paid_amount || 0;
      return sum + (amt - paid);
    }, 0);

    res.json({
      student,
      subjects,
      attendance: attendanceSummary,
      pendingFees,
      recentNotes: recentNotes.map(n => ({
        _id: n._id,
        title: n.title,
        file_type: n.file_type,
        label: n.label || '',
        subject_name: n.subject_id?.subject_name || '',
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/student/:id/attendance// 
router.get('/:id/attendance', enforceStudentOwnership, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Get student details
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch only matching subjects
    const subjects = await Subject.find({
      department: student.department,
      semester: student.semester
    });

    const attendanceRecords = await Attendance.find({
      student_id: studentId
    }).populate('subject_id', 'subject_name');

    const summary = subjects.map(sub => {
      const subLogs = attendanceRecords.filter(
        a => a.subject_id?._id.toString() === sub._id.toString()
      );

      const present = subLogs.filter(
        a => a.status === 'Present'
      ).length;

      const total = subLogs.length;

      const percentage =
        total > 0
          ? Math.round((present / total) * 100)
          : 0;

      return {
        _id: sub._id,
        subject_name: sub.subject_name,
        percentage,
        present,
        total,
        history: subLogs.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        ).slice(0, 50)
      };
    });

    res.json({ attendance: summary });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/student/:id/fees
router.get('/:id/fees', enforceStudentOwnership, async (req, res) => {
  try {
    const fees = await Fee.find({ student_id: req.params.id })
      .sort({ due_date: -1 })
      .limit(20);
    res.json({ fees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/student/:id/notes
router.get('/:id/notes', enforceStudentOwnership, async (req, res) => {
  try {
    const { department, semester, page = 1, limit = 6, file_type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};

    if (file_type === 'exam') {
      query.is_common = true;
    } else {
      if (department === 'All') {
        // Fetch all notes
      } else if (department && semester) {
        const subjects = await Subject.find({ department, semester: Number(semester) });
        const subjectIds = subjects.map(s => s._id);
        query.subject_id = { $in: subjectIds };
        query.is_common = { $ne: true };
      } else {
        return res.json({ notes: [], total: 0, pages: 0 });
      }

      if (file_type && file_type !== 'all') {
        query.file_type = file_type;
      }
    }

    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .populate('subject_id', 'subject_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Calculate counts for filters
    let counts = { all: 0, pdf: 0, image: 0, exam: 0 };
    if (department && department !== 'All' && semester) {
      const subjectIds = (await Subject.find({ department, semester: Number(semester) })).map(s => s._id);
      const baseQuery = { subject_id: { $in: subjectIds }, is_common: { $ne: true } };
      const [all, pdf, image, exam] = await Promise.all([
        Note.countDocuments(baseQuery),
        Note.countDocuments({ ...baseQuery, file_type: 'pdf' }),
        Note.countDocuments({ ...baseQuery, file_type: 'image' }),
        Note.countDocuments({ is_common: true })
      ]);
      counts = { all, pdf, image, exam };
    }

    res.json({
      notes: notes.map(n => ({
        _id: n._id,
        title: n.title,
        label: n.label || '',
        file_type: n.file_type,
        subject_id: { subject_name: n.subject_id?.subject_name || '' },
        is_common: n.is_common || false,
        exam_date: n.exam_date || null,
        description: n.description || '',
      })),
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      counts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/student/:id/notes/:noteId/request-view
router.post('/:id/notes/:noteId/request-view', enforceStudentOwnership, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const note = await Note.findById(req.params.noteId).populate('subject_id');
    if (!student || !note) return res.status(404).json({ error: 'Not found' });

    if (!note.is_common) {
      if (note.subject_id.department !== student.department || note.subject_id.semester !== student.semester) {
         return res.status(403).json({ error: 'Unauthorized access to this document' });
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    await ViewToken.create({
      token,
      student_id: student._id,
      note_id: note._id
    });

    res.json({ viewToken: token });
  } catch (err) {
    res.status(500).json({ error: 'Server error generating token' });
  }
});

// GET /api/student/:id/notes/:noteId/view
router.get('/:id/notes/:noteId/view', enforceStudentOwnership, viewRateLimiter, async (req, res) => {
  try {
    const clientToken = req.header('X-View-Token');
    if (!clientToken) return res.status(400).json({ error: 'Missing View Token' });

    // Atomically find and delete the token to ensure single use
    const viewTokenRecord = await ViewToken.findOneAndDelete({
      token: clientToken,
      student_id: req.params.id,
      note_id: req.params.noteId
    });

    if (!viewTokenRecord) {
      return res.status(403).json({ error: 'Token expired or already consumed' });
    }

    const student = await Student.findById(req.params.id);
    const note = await Note.findById(req.params.noteId).populate('subject_id');
    if (!student || !note) return res.status(404).json({ error: 'Not found' });

    // Log access
    await DocumentAccessLog.create({
      student_id: student._id,
      note_id: note._id,
      ip_address: req.ip || req.connection?.remoteAddress || 'unknown'
    });

    const fileUrl = note.fileUrl;
    if (!fileUrl) return res.status(404).json({ error: 'File not found' });

    // Set Secure Headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Disposition', 'inline; filename="document"');

    const watermarkText = `${student.name || 'Student'} - ${student.email || ''} - ${new Date().toISOString()}`;

    // Fetch from Cloudinary and process
    https.get(fileUrl, (response) => {
      if (response.statusCode !== 200) {
        return res.status(500).json({ error: 'Error fetching file from storage' });
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        
        try {
          if (note.file_type === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            const pdfDoc = await PDFDocument.load(buffer);
            const pages = pdfDoc.getPages();
            for (const page of pages) {
              const { width, height } = page.getSize();
              page.drawText(watermarkText, {
                x: 50,
                y: height / 2,
                size: 24,
                color: rgb(0.75, 0.75, 0.75),
                rotate: degrees(45),
                opacity: 0.5,
              });
            }
            const pdfBytes = await pdfDoc.save();
            return res.end(Buffer.from(pdfBytes));
          } else {
            // Image
            res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
            const image = await Jimp.read(buffer);
            const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
            // Print at bottom left
            image.print(font, 20, image.bitmap.height - 50, watermarkText);
            const imgBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
            return res.end(imgBuffer);
          }
        } catch (procErr) {
          console.error('[Watermarking Error]:', procErr);
          return res.status(500).json({ error: 'Error processing document' });
        }
      });
    }).on('error', (err) => {
      console.error('[Network Error]:', err);
      res.status(500).json({ error: 'Network error fetching document' });
    });

  } catch (err) {
    console.error('[Document View Error]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

