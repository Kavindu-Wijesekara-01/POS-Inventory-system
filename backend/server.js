const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const inventoryRoutes = require('./routes/inventoryRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const orderRoutes = require('./routes/orderRoutes');
const staffRoutes = require('./routes/staffRoutes');
const settingRoutes = require('./routes/settingRoutes');

// 1. Auth Routes ගොනුව මෙතනට ගෙන්වා ගැනීම (Import)
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// 2. මෙන්න මේක තමයි ඔයාගේ අඩු පේළිය!
// Frontend එකෙන් '/api/auth' කියලා එන හැම ඉල්ලීමක්ම authRoutes එකට යවනවා.
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/loyalty', loyaltyRoutes); // අලුත් පේළිය
app.use('/api/orders', orderRoutes); // මේක අලුතෙන් එකතු කරන්න
app.use('/api/staff', staffRoutes); // <--- මේ පේළිය අනිවාර්යයෙන්ම තියෙන්න ඕන
app.use('/api/settings', settingRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));