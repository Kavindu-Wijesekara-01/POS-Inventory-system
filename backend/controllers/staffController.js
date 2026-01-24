const User = require('../models/User'); // ඔබේ Login Model එකේ නම මෙතනට දාන්න

// 1. Get All Staff
exports.getAllStaff = async (req, res) => {
  try {
    // Password එක අයින් කරලා අනිත් විස්තර එවන්න (-password)
    const staff = await User.find().select('-password').sort({ _id: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Add New Staff (Register)
exports.addStaff = async (req, res) => {
  const { name, username, password, staffId } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = await User.create({
      name,
      username,
      password, // සැබෑ ලෝකයේදී Hash කරන්න ඕන (bcrypt), දැනට නිකන් තියමු
      staffId,
      isAdmin: false // Staff නිසා Admin නෙවෙයි
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        staffId: user.staffId
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Delete Staff
exports.deleteStaff = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Staff Removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};