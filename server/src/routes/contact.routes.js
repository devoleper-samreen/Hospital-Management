const express = require('express');
const { submitQuery } = require('../controllers/contact.controller');

const router = express.Router();

router.post('/', submitQuery);

module.exports = router;
