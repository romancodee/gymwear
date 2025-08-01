import mongoose from "mongoose";

const AddressSchema=new mongoose.Schema({
  firstName: String,
  lastName: String,
  email : String,
  phone: String,
  address: String,
  city: String,
  zipCode: String,
  country: String,
  isDefault: { type: Boolean, default: false },

},{ _id: true })

const userSchema = new mongoose.Schema({
   addresses: {
    type: [AddressSchema],   // ✅ FIXED HERE
    default: []              // ✅ Ensures it's never undefined
  },
  firstname: {
    type: String,
    required: [true, "Please enter a first name"],
    trim: true,
  },
  lastname: {
    type: String,
    required: [true, "Please enter a last name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'], 
    default: 'user',        
  },
  isActive:{
    type:Boolean,
    default:true
  },
 
  forgetPasswordToken: String,
  forgetPasswordTokenExpires: Date,
  verifyToken: String,
  verifyTokenExpires: Date,
  resetToken: String,
  resetTokenExpiry: Date,
});


const User = mongoose.models.Userinfo || mongoose.model("Userinfo", userSchema);

export default User;

