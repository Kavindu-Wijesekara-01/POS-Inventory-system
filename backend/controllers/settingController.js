const Setting = require('../models/Setting');

// 1. Get Settings (If not exists, create default)
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // පළවෙනි පාරට Run වෙද්දී Default එකක් හදනවා
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Update Settings
exports.updateSettings = async (req, res) => {
  try {
    // තියෙන පලවෙනි එක Update කරනවා (upsert: true නිසා නැත්නම් හදනවා)
    const updatedSettings = await Setting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};