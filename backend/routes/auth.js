const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// ── POST /api/auth/login ─────────────────────────────────────────────────────
// Public. Authenticates user and returns JWT.
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // 1. Try finding in primary User collection
      let account = await User.findOne({ email: normalizedEmail }).select('+password +sessionToken +sessionExpiresAt');

      // 2. Fallback to Staff collection
      if (!account) {
        account = await Staff.findOne({ email: normalizedEmail }).select('+password +sessionToken +sessionExpiresAt');
      }

      // 3. Fallback to Student collection
      if (!account) {
        account = await Student.findOne({ email: normalizedEmail }).select('+password +sessionToken +sessionExpiresAt');
        if (account) account.role = 'student'; // Ensure role is set for students
      }

      if (!account) {
        const { logAuthAttempt } = require('../utils/logger');
        logAuthAttempt(normalizedEmail, false, null, { reason: 'Account not found', ip: req.ip });
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // 3. Verify password using matchPassword method
      const isMatch = await account.matchPassword(password);
      if (!isMatch) {
        const { logAuthAttempt } = require('../utils/logger');
        logAuthAttempt(normalizedEmail, false, account.role, { reason: 'Password mismatch', ip: req.ip });
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // 4. Check for active session
      if (account.sessionToken && account.sessionExpiresAt && account.sessionExpiresAt > Date.now()) {
        const { logAuthAttempt } = require('../utils/logger');
        logAuthAttempt(normalizedEmail, false, account.role, { reason: 'Concurrent login blocked', ip: req.ip });
        return res.status(403).json({ error: 'Account is already logged in on another device. Please log out from the other device or wait until the session expires.' });
      }

      // 5. Generate and save new session
      const sessionToken = crypto.randomBytes(16).toString('hex');
      account.sessionToken = sessionToken;
      account.sessionExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      await account.save();

      // 6. Generate JWT
      const token = jwt.sign(
        { id: account._id, role: account.role, sessionToken },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      const { logAuthAttempt } = require('../utils/logger');
      logAuthAttempt(normalizedEmail, true, account.role, { ip: req.ip });

      res.json({
        token,
        role: account.role,
        user: {
          _id: account._id,
          id: account._id,
          name: account.name,
          email: account.email,
          avatar: account.avatar || '',
          role: account.role,
          // Include extra fields for students/staff if they exist
          user_id: account.user_id,
          department: account.department,
          semester: account.semester,
          student_contact: account.student_contact,
          parent_contact: account.parent_contact,
          enrollment_type: account.enrollment_type,
        },
      });
    } catch (err) {
      console.error('[Auth] Login error:', err);
      res.status(500).json({ error: 'Server error during authentication' });
    }
  }
);

// ── POST /api/auth/logout ────────────────────────────────────────────────────
// Protected. Clears the active session for the user.
router.post('/logout', protect, async (req, res) => {
  try {
    let account = await User.findById(req.user.id).select('+sessionToken +sessionExpiresAt');
    if (!account) {
      account = await Staff.findById(req.user.id).select('+sessionToken +sessionExpiresAt');
    }
    if (!account) {
      account = await Student.findById(req.user.id).select('+sessionToken +sessionExpiresAt');
    }

    if (account) {
      account.sessionToken = undefined;
      account.sessionExpiresAt = undefined;
      await account.save();
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('[Auth] Logout error:', err);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
// Protected. Returns current user data.
router.get('/me', protect, async (req, res) => {
  try {
    let account = await User.findById(req.user.id);
    if (!account) {
      account = await Staff.findById(req.user.id);
    }
    if (!account) {
      account = await Student.findById(req.user.id);
      if (account) account.role = 'student';
    }

    if (!account) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      _id: account._id,
      id: account._id,
      name: account.name,
      email: account.email,
      avatar: account.avatar || '',
      role: account.role,
      user_id: account.user_id,
      department: account.department,
      semester: account.semester,
      student_contact: account.student_contact,
      parent_contact: account.parent_contact,
      enrollment_type: account.enrollment_type,
    });
  } catch (err) {
    console.error('[Auth] getMe error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
// Public. Generates a secure password reset token and saves it (hashed) in the database.
// Implements generic responses to prevent user enumeration attacks.
router.post('/forgot-password',
  passwordResetLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Generic response message
      const genericSuccessMessage = 'If an account with that email exists, a password reset link has been sent.';

      // Find user in collections
      let account = await User.findOne({ email: normalizedEmail });
      let modelType = 'User';

      if (!account) {
        account = await Staff.findOne({ email: normalizedEmail });
        modelType = 'Staff';
      }

      if (!account) {
        account = await Student.findOne({ email: normalizedEmail });
        modelType = 'Student';
      }

      // Anti-enumeration: if no account exists, return generic success
      if (!account) {
        console.log(`[Forgot Password] Request for non-existent email: ${normalizedEmail}`);
        return res.json({ message: genericSuccessMessage });
      }

      // Generate cryptographically secure random token (plain hex)
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Hash token using SHA-256 for database storage
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set token expiration (10 minutes)
      const expireTime = Date.now() + 10 * 60 * 1000;

      // Update and save the user document with selected false fields
      account.resetPasswordToken = hashedToken;
      account.resetPasswordExpire = expireTime;
      await account.save();

      // Secure console log (simulates mailer in dev/production sandbox)
      console.log('\n======================================================');
      console.log(`[SECURITY MAILER SIMULATOR]`);
      console.log(`To: ${normalizedEmail}`);
      console.log(`Role / Model: ${account.role || 'student'} / ${modelType}`);
      console.log(`Plaintext Token: ${resetToken}`);
      console.log(`Reset Link: http://localhost:5173/reset-password/${resetToken}`);
      console.log(`Expires: 10 minutes from now`);
      console.log('======================================================\n');

      res.json({ message: genericSuccessMessage });
    } catch (err) {
      console.error('[Forgot Password] Error:', err);
      res.status(500).json({ error: 'Server error during password reset request' });
    }
  }
);

// ── POST /api/auth/reset-password/:token ──────────────────────────────────────
// Public. Resets user password using the secure plaintext token.
router.post('/reset-password/:token',
  passwordResetLimiter,
  [
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      // Hash the token using SHA-256 to compare with database
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Query across all three collections for an unexpired matching token
      const query = {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
      };

      // Check User
      let account = await User.findOne(query).select('+password');
      
      // Check Staff
      if (!account) {
        account = await Staff.findOne(query).select('+password');
      }

      // Check Student
      if (!account) {
        account = await Student.findOne(query).select('+password');
      }

      if (!account) {
        console.warn(`[Reset Password] Attempted reset with invalid or expired token.`);
        return res.status(400).json({ error: 'Invalid or expired password reset token' });
      }

      // Update password and clear reset fields
      account.password = newPassword;
      account.resetPasswordToken = undefined;
      account.resetPasswordExpire = undefined;
      await account.save();

      console.log(`[Reset Password] Password successfully updated for account ID: ${account._id}`);
      res.json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (err) {
      console.error('[Reset Password] Error:', err);
      res.status(500).json({ error: 'Server error during password reset execution' });
    }
  }
);

module.exports = router;