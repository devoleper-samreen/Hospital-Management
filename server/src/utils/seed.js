require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || 'admin@hospital.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  await User.create({ name: 'Hospital Admin', email, password, role: 'admin' });
  console.log(`Admin created -> email: ${email} password: ${password}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
