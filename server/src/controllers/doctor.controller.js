const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

async function getSelfDoctor(userId) {
  return Doctor.findOne({ userId });
}

async function getDashboard(req, res, next) {
  try {
    const doctor = await getSelfDoctor(req.user._id);
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    const [pendingCount, todayCount] = await Promise.all([
      Appointment.countDocuments({ doctor: doctor._id, status: 'pending' }),
      Appointment.countDocuments({
        doctor: doctor._id,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
    ]);
    res.json({ doctor, pendingCount, todayCount });
  } catch (err) {
    next(err);
  }
}

async function getAppointments(req, res, next) {
  try {
    const doctor = await getSelfDoctor(req.user._id);
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate({ path: 'patient', populate: { path: 'userId', select: 'name email phone' } })
      .sort({ date: -1 });
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const doctor = await getSelfDoctor(req.user._id);
    const { status, notes } = req.body;
    const appointment = await Appointment.findOne({ _id: req.params.id, doctor: doctor._id });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    await appointment.save();
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

async function getPatients(req, res, next) {
  try {
    const doctor = await getSelfDoctor(req.user._id);
    const appointedPatientIds = await Appointment.distinct('patient', { doctor: doctor._id });
    const patients = await Patient.find({
      $or: [{ consultingDoctor: doctor._id }, { _id: { $in: appointedPatientIds } }],
    }).populate('userId', 'name email phone');
    res.json({ patients });
  } catch (err) {
    next(err);
  }
}

async function updatePatient(req, res, next) {
  try {
    const doctor = await getSelfDoctor(req.user._id);
    const { note, assignToMe } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    if (assignToMe || (note && !patient.consultingDoctor)) patient.consultingDoctor = doctor._id;
    if (note) {
      patient.medicalHistory.push({ note, prescribedBy: doctor._id, date: new Date() });
    }
    await patient.save();
    res.json({ patient });
  } catch (err) {
    next(err);
  }
}

async function searchPatients(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) return res.json({ patients: [] });
    const matchedUsers = await User.find({
      role: 'patient',
      $or: [{ name: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }],
    }).select('_id');
    const patients = await Patient.find({ userId: { $in: matchedUsers.map((u) => u._id) } }).populate(
      'userId',
      'name email phone'
    );
    res.json({ patients });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  getAppointments,
  updateAppointment,
  getPatients,
  updatePatient,
  searchPatients,
};
