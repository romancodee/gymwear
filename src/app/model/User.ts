import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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

