import mongoose from "mongoose";
import product from "../model/product"
import dummyprod from "../lib/dummyproduct"
import dbconnect from "../lib/dbconnect"


const products = [ /* Paste the 20 product objects here */ ];

async function seedDB() {
  try {
    await dbconnect()

    await product.deleteMany(); // optional: clear existing data
    await product.insertMany(dummyprod);

    console.log('✅ Seed data inserted successfully!');
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedDB();
