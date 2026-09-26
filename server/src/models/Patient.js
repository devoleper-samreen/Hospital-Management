const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    address: { type: String, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    consultingDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    medicalHistory: [
      {
        note: { type: String, trim: true },
        prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
