require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const fs = require('fs');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const data = JSON.parse(fs.readFileSync('gymshark-dummy-products.json', 'utf-8'));

    await Product.deleteMany();
    await Product.insertMany(data);

    console.log('✅ Products seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
