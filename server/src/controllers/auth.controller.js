const crypto = require('crypto');
const User = require('../models/User');
const Patient = require('../models/Patient');
const SessionLog = require('../models/SessionLog');
const generateToken = require('../utils/generateToken');

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : email;
}

async function register(req, res, next) {
  try {
    const { name, password, phone } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, phone, role: 'patient' });
    await Patient.create({ userId: user._id });
    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }
    const session = await SessionLog.create({ user: user._id, role: user.role });
    const token = generateToken(user);
    res.json({
      token,
      sessionId: session._id,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      await SessionLog.findByIdAndUpdate(sessionId, { logoutAt: new Date() });
    } else {
      await SessionLog.findOneAndUpdate(
        { user: req.user._id, logoutAt: { $exists: false } },
        { logoutAt: new Date() },
        { sort: { loginAt: -1 } }
      );
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    // No email service wired up yet; token is returned directly for local/dev use.
    res.json({ message: 'Password reset token generated', resetToken });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'token and password are required' });
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');
    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password has been reset' });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { ...(name && { name }), ...(phone && { phone }) } },
      { new: true }
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
};
