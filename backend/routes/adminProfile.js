const express = require('express');
const { getProfile, updateProfile, changePassword } = require('../controllers/adminProfileController');
const { protect, staffOrAdminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, staffOrAdminOnly);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

module.exports = router;