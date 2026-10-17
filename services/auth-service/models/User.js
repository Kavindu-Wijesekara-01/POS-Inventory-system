const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Staff Management සඳහා
  name: { 
    type: String, 
    required: true 
  },
  staffId: { 
    type: String, 
    required: true, 
    unique: true // Staff ID එක ඩුප්ලිකේට් වෙන්න බෑ
  },
  
  // Login Credentials
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'user'], 
    default: 'user' 
  }
});

// Password Save වීමට පෙර Hash (Encrypt) කිරීම
userSchema.pre('save', async function(next) {
  // Password එක වෙනස් වෙලා නැත්නම් මේක මගහරින්න
  if (!this.isModified('password')) {
    return next();
  }

  // Password එක Hash කරන්න
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Login වන විට Password ගැලපේදැයි බැලීම
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
