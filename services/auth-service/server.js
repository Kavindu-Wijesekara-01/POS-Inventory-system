const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ service: 'auth-service', status: 'UP', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Auth Service - MongoDB Connected'))
  .catch((err) => console.log('❌ Auth Service - DB Error:', err));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`🔐 Auth Service running on port ${PORT}`));
