const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', verifyToken, changePassword);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
