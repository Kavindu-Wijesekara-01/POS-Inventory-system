const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const orderRoutes = require('./routes/orderRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ service: 'order-service', status: 'UP', timestamp: new Date() });
});

// Routes
app.use('/api/orders', orderRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Order Service - MongoDB Connected'))
  .catch((err) => console.log('❌ Order Service - DB Error:', err));

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => console.log(`🛒 Order Service running on port ${PORT}`));
