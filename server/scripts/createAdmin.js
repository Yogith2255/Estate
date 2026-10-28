require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('Error: MONGODB_URI not found in environment.');
      process.exit(1);
    }

    await mongoose.connect(uri, { dbName: 'estatehub' });
    console.log('[Setup] Connected to database.');

    const adminEmail = process.env.ADMIN_EMAIL || process.argv[2] || 'admin@demo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || process.argv[3] || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || process.argv[4] || 'Sunita Reddy';
    const adminPhone = process.env.ADMIN_PHONE || '+91 99100 11111';

    let existing = await User.findOne({ email: adminEmail.toLowerCase().trim() });
    if (existing) {
      console.log(`[Setup] Admin user already exists with email: ${adminEmail}`);
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log(`[Setup] Updated ${adminEmail} to admin role.`);
      }
      await mongoose.disconnect();
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const newAdmin = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase().trim(),
      phone: adminPhone,
      passwordHash,
      role: 'admin',
      status: 'active',
      agency: 'EstateHub Executive Leadership',
    });

    console.log(`[Setup] Successfully created initial administrator:`);
    console.log(`  - Name:  ${newAdmin.name}`);
    console.log(`  - Email: ${newAdmin.email}`);
    console.log(`  - Role:  ${newAdmin.role}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Setup] Error creating administrator:', error.message);
    process.exit(1);
  }
}

createAdmin();
