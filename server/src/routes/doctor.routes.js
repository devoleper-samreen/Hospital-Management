const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const {
  getDashboard,
  getAppointments,
  updateAppointment,
  getPatients,
  updatePatient,
  searchPatients,
} = require('../controllers/doctor.controller');

const router = express.Router();

router.use(verifyToken, authorizeRoles('doctor'));

router.get('/dashboard', getDashboard);

router.get('/appointments', getAppointments);
router.put('/appointments/:id', updateAppointment);

router.get('/patients', getPatients);
router.put('/patients/:id', updatePatient);
router.get('/patients/search', searchPatients);

module.exports = router;
