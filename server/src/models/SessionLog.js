const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'doctor', 'patient'], required: true },
    loginAt: { type: Date, default: Date.now },
    logoutAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SessionLog', sessionLogSchema);
