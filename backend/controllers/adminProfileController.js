// controllers/adminProfileController.js
// All operations target the `users` collection via the User model.

const bcrypt = require('bcryptjs');
const User   = require('../models/User');
const Staff  = require('../models/Staff');

// GET /api/admin/profile
exports.getProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) user = await Staff.findById(req.user.id);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role });
  } catch (err) {
    console.error('getProfile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/admin/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    if (!name || !email)
      return res.status(400).json({ error: 'Name and email are required' });

    // Try User first
    let updated = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim(), email: email.trim().toLowerCase(), avatar: avatar || '' },
      { new: true, runValidators: true }
    );

    // If not found, try Staff
    if (!updated) {
      updated = await Staff.findByIdAndUpdate(
        req.user.id,
        { name: name.trim(), email: email.trim().toLowerCase(), avatar: avatar || '' },
        { new: true, runValidators: true }
      );
    }

    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ id: updated._id, name: updated.name, email: updated.email, avatar: updated.avatar, role: updated.role });
  } catch (err) {
    console.error('updateProfile error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already in use by another account' });
    }
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// PUT /api/admin/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both passwords are required' });
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters' });

    console.log(`[changePassword] Start for user ID: ${req.user.id}`);
    let user = await User.findById(req.user.id).select('+password');
    if (!user) {
      console.log(`[changePassword] User not found in User collection, trying Staff...`);
      user = await Staff.findById(req.user.id).select('+password');
    }
    
    if (!user) {
      console.log(`[changePassword] User not found in either collection.`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[changePassword] User found. Comparing passwords...`);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      console.log(`[changePassword] Password mismatch.`);
      return res.status(403).json({ error: 'Current password is incorrect' });
    }

    if (currentPassword === newPassword)
      return res.status(400).json({ error: 'New password must differ from the current one' });

    console.log(`[changePassword] Hashing and saving new password...`);
    user.password = newPassword; 
    await user.save();

    console.log(`[changePassword] Success.`);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};