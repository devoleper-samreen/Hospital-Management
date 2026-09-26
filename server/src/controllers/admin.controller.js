const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const ContactQuery = require('../models/ContactQuery');
const SessionLog = require('../models/SessionLog');

async function getDashboard(req, res, next) {
  try {
    const [patientCount, doctorCount, appointmentCount, newQueryCount] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      ContactQuery.countDocuments({ status: 'new' }),
    ]);
    res.json({ patientCount, doctorCount, appointmentCount, newQueryCount });
  } catch (err) {
    next(err);
  }
}

// ---- Doctors ----
async function createDoctor(req, res, next) {
  try {
    const { name, email, password, phone, specialization, department, qualification, availability } = req.body;
    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ message: 'name, email, password and specialization are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, phone, role: 'doctor' });
    const doctor = await Doctor.create({
      userId: user._id,
      specialization,
      department,
      qualification,
      availability,
    });
    res.status(201).json({
      doctor: {
        ...doctor.toObject(),
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone, isActive: user.isActive },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getDoctors(req, res, next) {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email phone isActive');
    res.json({ doctors });
  } catch (err) {
    next(err);
  }
}

async function updateDoctor(req, res, next) {
  try {
    const { specialization, department, qualification, availability, name, phone, isActive } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    Object.assign(doctor, {
      ...(specialization && { specialization }),
      ...(department !== undefined && { department }),
      ...(qualification !== undefined && { qualification }),
      ...(availability !== undefined && { availability }),
    });
    await doctor.save();

    if (name || phone !== undefined || isActive !== undefined) {
      await User.findByIdAndUpdate(doctor.userId, {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(isActive !== undefined && { isActive }),
      });
    }
    const populated = await Doctor.findById(doctor._id).populate('userId', 'name email phone isActive');
    res.json({ doctor: populated });
  } catch (err) {
    next(err);
  }
}

// ---- Users (who booked appointments online) ----
async function getUsers(req, res, next) {
  try {
    const users = await User.find({ role: 'patient' }).select('-password');
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Patient.findOneAndDelete({ userId: user._id });
    res.json({ message: 'User removed' });
  } catch (err) {
    next(err);
  }
}

// ---- Patients ----
async function getPatients(req, res, next) {
  try {
    const patients = await Patient.find()
      .populate('userId', 'name email phone')
      .populate('consultingDoctor', 'specialization');
    res.json({ patients });
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

// ---- Appointments ----
async function getAppointmentHistory(req, res, next) {
  try {
    const appointments = await Appointment.find()
      .populate({ path: 'patient', populate: { path: 'userId', select: 'name email phone' } })
      .populate({ path: 'doctor', populate: { path: 'userId', select: 'name email' } })
      .sort({ date: -1 });
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

// ---- Contact Us queries ----
async function getQueries(req, res, next) {
  try {
    const queries = await ContactQuery.find().sort({ createdAt: -1 });
    res.json({ queries });
  } catch (err) {
    next(err);
  }
}

async function markQueryRead(req, res, next) {
  try {
    const query = await ContactQuery.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true });
    if (!query) return res.status(404).json({ message: 'Query not found' });
    res.json({ query });
  } catch (err) {
    next(err);
  }
}

// ---- Session logs ----
async function getSessionLogs(req, res, next) {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const logs = await SessionLog.find(filter).populate('user', 'name email role').sort({ loginAt: -1 });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
}

// ---- Reports ----
async function getReports(req, res, next) {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    const appointments = await Appointment.find(filter)
      .populate({ path: 'patient', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } });
    res.json({ count: appointments.length, appointments });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  createDoctor,
  getDoctors,
  updateDoctor,
  getUsers,
  deleteUser,
  getPatients,
  searchPatients,
  getAppointmentHistory,
  getQueries,
  markQueryRead,
  getSessionLogs,
  getReports,
};
