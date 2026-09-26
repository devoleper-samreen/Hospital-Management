const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const {
  getDashboard,
  listDoctors,
  bookAppointment,
  getAppointments,
  getMedicalHistory,
} = require('../controllers/patient.controller');

const router = express.Router();

router.use(verifyToken, authorizeRoles('patient'));

router.get('/dashboard', getDashboard);
router.get('/doctors', listDoctors);

router.get('/appointments', getAppointments);
router.post('/appointments', bookAppointment);

router.get('/medical-history', getMedicalHistory);

module.exports = router;
