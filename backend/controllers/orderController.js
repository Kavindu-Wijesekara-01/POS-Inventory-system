const Order = require('../models/Order');

// 1. Create New Order (Save Sale)
exports.createOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
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

    // දින පරාසයක් තෝරාගෙන ඇත්නම් (Date Range Filter)
    if (startDate && endDate) {
      // endDate එකේ දවස ඉවර වෙන වෙලාව (23:59:59) ගන්න ඕන, නැත්නම් ඒ දවසේ බිල් මිස් වෙනවා
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.date = {
        $gte: new Date(startDate), // පටන් ගන්න දවස (Greater than or equal)
        $lte: end                  // ඉවර වෙන දවස (Less than or equal)
      };
    }

    // අලුත්ම Orders උඩින් පෙන්වන්න (Sort by date descending)
    const orders = await Order.find(query).sort({ date: -1 }).populate('customer', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Analytics Data (AI & Charts සඳහා)
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
            { $sort: { _id: 1 } } // දිනය අනුව පෙළගස්වන්න
        ]);

        // 2. Top Selling Items (All Time)
        const topItems = await Order.aggregate([
            { $unwind: "$items" }, // Item එකින් එක කඩනවා
            { $group: {
                _id: "$items.name",
                qty: { $sum: "$items.qty" },
                sales: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
            }},
            { $sort: { qty: -1 } }, // වැඩිම විකුණුනු ඒවා උඩට
            { $limit: 5 } // Top 5 විතරක් ගන්නවා
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
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};