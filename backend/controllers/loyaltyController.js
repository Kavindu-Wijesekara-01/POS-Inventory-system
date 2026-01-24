const Loyalty = require('../models/Loyalty');

// 1. Check Loyalty by Phone
exports.checkLoyalty = async (req, res) => {
  const { phone } = req.body;
  try {
    const member = await Loyalty.findOne({ phone });
    if (member) {
      res.json({ found: true, member });
    } else {
      res.json({ found: false, message: "Member not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Add New Loyalty Member
exports.addLoyaltyMember = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const existing = await Loyalty.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    const newMember = await Loyalty.create({ name, email, phone });
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get All Members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Loyalty.find().sort({ joinedAt: -1 }); // අලුත්ම අය උඩින්
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Member
exports.updateMember = async (req, res) => {
  try {
    const updatedMember = await Loyalty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Delete Member
exports.deleteMember = async (req, res) => {
  try {
    await Loyalty.findByIdAndDelete(req.params.id);
    res.json({ message: "Member Removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};