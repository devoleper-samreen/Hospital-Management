const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    qualification: { type: String, trim: true },
    availability: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
