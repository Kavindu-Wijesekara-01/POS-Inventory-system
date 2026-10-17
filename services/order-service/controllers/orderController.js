const Order = require('../models/Order');

// 1. Create New Order (Save Sale)
exports.createOrder = async (req, res) => {
  try {
    const orderData = { ...req.body };
    
    // Microservice Architecture: customer field එක string ID විදියට store කරනවා
    // Frontend එකෙන් customerName එකත් එවනවා
    if (orderData.customer && typeof orderData.customer === 'object') {
      orderData.customer = orderData.customer.toString();
    }

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Orders (With Date Filter)
exports.getOrders = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.date = {
        $gte: new Date(startDate),
        $lte: end
      };
    }

    // Microservice version: populate() අවශ්‍ය නෑ - customerName directly stored
    const orders = await Order.find(query).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Analytics Data
exports.getAnalytics = async (req, res) => {
    try {
        const today = new Date();
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 7);

        // 1. Daily Sales Trend (Last 7 Days)
        const dailySales = await Order.aggregate([
            { $match: { date: { $gte: last7Days } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                total: { $sum: "$grandTotal" },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        // 2. Top Selling Items (All Time)
        const topItems = await Order.aggregate([
            { $unwind: "$items" },
            { $group: {
                _id: "$items.name",
                qty: { $sum: "$items.qty" },
                sales: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
            }},
            { $sort: { qty: -1 } },
            { $limit: 5 }
        ]);

        // 3. Payment Methods Distribution
        const paymentStats = await Order.aggregate([
            { $group: {
                _id: "$paymentMethod",
                count: { $sum: 1 },
                amount: { $sum: "$grandTotal" }
            }}
        ]);

        res.json({ dailySales, topItems, paymentStats });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Delete Order
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
