const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

async function getSelfPatient(userId) {
  return Patient.findOne({ userId });
}

async function getDashboard(req, res, next) {
  try {
    const patient = await getSelfPatient(req.user._id);
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    const upcomingCount = await Appointment.countDocuments({
      patient: patient._id,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'approved'] },
    });
    res.json({ patient, upcomingCount });
  } catch (err) {
    next(err);
  }
}

async function listDoctors(req, res, next) {
  try {
    const doctors = await Doctor.find().populate('userId', 'name');
    res.json({ doctors });
  } catch (err) {
    next(err);
  }
}

async function bookAppointment(req, res, next) {
  try {
    const patient = await getSelfPatient(req.user._id);
    const { doctorId, date, time, reason } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'doctorId, date and time are required' });
    }
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      date,
      time,
      reason,
    });
    res.status(201).json({ appointment });
  } catch (err) {
    next(err);
  }
}

async function getAppointments(req, res, next) {
  try {
    const patient = await getSelfPatient(req.user._id);
    const appointments = await Appointment.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } })
      .sort({ date: -1 });
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

async function getMedicalHistory(req, res, next) {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('consultingDoctor', 'specialization')
      .populate('medicalHistory.prescribedBy', 'specialization');
    res.json({ medicalHistory: patient?.medicalHistory || [] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  listDoctors,
  bookAppointment,
  getAppointments,
  getMedicalHistory,
};
