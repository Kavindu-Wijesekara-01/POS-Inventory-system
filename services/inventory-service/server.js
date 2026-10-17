const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const inventoryRoutes = require('./routes/inventoryRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ service: 'inventory-service', status: 'UP', timestamp: new Date() });
});

// Routes
app.use('/api/inventory', inventoryRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Inventory Service - MongoDB Connected'))
  .catch((err) => console.log('❌ Inventory Service - DB Error:', err));

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`📦 Inventory Service running on port ${PORT}`));
