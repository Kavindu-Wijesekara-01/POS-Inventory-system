const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// 1. LOGIN USER
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. REGISTER STAFF (CREATE)
exports.registerUser = async (req, res) => {
  const { name, staffId, username, password, role } = req.body;

  try {
    // Check if username exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Check if Staff ID exists
    const staffIdExists = await User.findOne({ staffId });
    if (staffIdExists) {
        return res.status(400).json({ message: 'Staff ID already exists' });
    }

    // Create User
    const user = await User.create({
      name,
      staffId,
      username,
      password,
      role: role || 'user'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        staffId: user.staffId,
        username: user.username,
        role: user.role,
        message: "Staff Created Successfully"
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 3. GET ALL STAFF
exports.getAllStaff = async (req, res) => {
    try {
        // { role: 'user' } කෑල්ල අයින් කළා. දැන් Admin + Staff ඔක්කොම එවනවා.
        const staff = await User.find().select('-password').sort({ _id: -1 }); 
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. UPDATE STAFF
exports.updateStaff = async (req, res) => {
    try {
        // Password එක update කරන්නේ නෑ මේ function එකෙන්
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. DELETE STAFF
exports.deleteStaff = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Staff Removed Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};