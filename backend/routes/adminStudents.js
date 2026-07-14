const express = require('express');
const bcrypt  = require('bcryptjs');
const Student = require('../models/Student');
const ActiveSession = require('../models/ActiveSession');
const { protect, staffOrAdminOnly } = require('../middleware/auth');
const { accountCreationLimiter } = require('../middleware/rateLimiters');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// All admin student routes require JWT + admin role
router.use(protect,  staffOrAdminOnly);

// GET /api/admin/active-students
router.get('/active-students', async (req, res) => {
  try {
    const activeSessions = await ActiveSession.find()
      .populate('student_id', 'name email department semester user_id student_contact')
      .sort({ last_active: -1 });

    res.json({ activeSessions });
  } catch (err) {
    console.error('[AdminStudents] GET /active-students error:', err);
    res.status(500).json({ error: 'Server error fetching active students' });
  }
});

// GET /api/admin/students
router.get('/', async (req, res) => {
  try {
    const { department, semester, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    
    if (department && department !== 'All') {
      query.department = department;
    }
    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      students,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (err) { 
    console.error('[AdminStudents] GET error:', err);
    res.status(500).json({ error: 'Server error' }); 
  }
});

// POST /api/admin/students
router.post('/',
  accountCreationLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
    body('user_id').trim().notEmpty().withMessage('User ID is required').isLength({ max: 50 }).withMessage('User ID must not exceed 50 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be a number between 1 and 8'),
    body('student_contact').optional().isString().isLength({ max: 15 }).withMessage('Student contact number must be a valid length'),
    body('parent_contact').optional().isString().isLength({ max: 15 }).withMessage('Parent contact number must be a valid length')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const {
      name,
      email,
      user_id,
      department,
      semester,
      password,
      student_contact,
      parent_contact
    } = req.body;

  try {
    // ✅ Check duplicate email
    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // ✅ Check duplicate user_id
    const existingUser = await Student.findOne({ user_id });
    if (existingUser) {
      return res.status(409).json({ error: 'User ID already exists' });
    }

    // ✅ Create student
    const student = await Student.create({
      name,
      email: email.toLowerCase(), // normalize
      user_id,
      password, // hashed by pre-save hook
      department: department || 'Computer Engineering',
      semester: Number(semester) || 1,
      student_contact: student_contact || '',
      parent_contact: parent_contact || '',
    });

    const { password: _, ...safe } = student.toObject();

    res.status(201).json(safe);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/students/:id
router.put('/:id', async (req, res) => {
  const { name, department, semester, student_contact, parent_contact, password } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (name) student.name = name;
    if (department) student.department = department;
    if (semester) student.semester = semester;
    if (student_contact !== undefined) student.student_contact = student_contact;
    if (parent_contact !== undefined) student.parent_contact = parent_contact;
    if (password) student.password = password; // pre-save hook hashes it

    await student.save();
    
    const { password: _, ...safe } = student.toObject();
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/students/:id
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/admin/students/promote-bulk
router.post('/promote-bulk', async (req, res) => {
  const { department, semester } = req.body;
  
  if (!department || !semester) {
    return res.status(400).json({ error: 'Department and semester are required' });
  }

  if (Number(semester) >= 6) {
    return res.status(400).json({ error: 'Cannot promote beyond semester 6' });
  }

  try {
    const result = await Student.updateMany(
      { department, semester: Number(semester) },
      { $inc: { semester: 1 } }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
