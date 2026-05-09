const express = require('express');
const bcrypt  = require('bcryptjs');
const Student = require('../models/Student');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// All admin student routes require JWT + admin role
router.use(protect, adminOnly);

// GET /api/admin/students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/admin/students
router.post('/', async (req, res) => {
  const { name, user_id, department, semester, password, student_contact, parent_contact } = req.body;
  if (!name || !user_id || !password) {
    return res.status(400).json({ error: 'name, user_id and password are required' });
  }
  try {
    const existing = await Student.findOne({ user_id });
    if (existing) return res.status(409).json({ error: 'User ID already exists' });

    const student = await Student.create({
      name, user_id,
      enrollment_no: user_id,
      password,           // hashed by pre-save hook
      department: department || 'Computer Engineering',
      semester: Number(semester) || 1,
      student_contact: student_contact || '',
      parent_contact:  parent_contact  || '',
    });

    const { password: _, ...safe } = student.toObject();
    res.status(201).json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/students/:id
router.put('/:id', async (req, res) => {
  const { name, department, semester, student_contact, parent_contact } = req.body;
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, department, semester, student_contact, parent_contact },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
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

module.exports = router;
