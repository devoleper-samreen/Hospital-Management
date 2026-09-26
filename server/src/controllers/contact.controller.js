const ContactQuery = require('../models/ContactQuery');

async function submitQuery(req, res, next) {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'name, email and message are required' });
    }
    const query = await ContactQuery.create({ name, email, message });
    res.status(201).json({ message: 'Query submitted successfully', query });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitQuery };
