import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, Award } from 'lucide-react';

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState("");

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/orders/analytics');
                setData(res.data);
                generateAIInsights(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching analytics", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const generateAIInsights = (analytics) => {
        const { dailySales, topItems } = analytics;
        
        if (!dailySales.length) return setAiInsight("No sufficient data to generate insights.");

        const todaySales = dailySales[dailySales.length - 1]?.total || 0;
        const yesterdaySales = dailySales[dailySales.length - 2]?.total || 0;
        let trendText = "";
        
        if (yesterdaySales === 0) {
            trendText = "Great start to the sales tracking!";
        } else if (todaySales > yesterdaySales) {
            const growth = ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1);
            trendText = `🚀 Sales are booming! You are up by ${growth}% compared to yesterday.`;
        } else {
            const drop = ((yesterdaySales - todaySales) / yesterdaySales * 100).toFixed(1);
            trendText = `📉 Sales have dipped slightly by ${drop}%. Consider running a 'Happy Hour' promo.`;
        }

        const heroProduct = topItems[0]?._id || "None";
        const heroText = `Your superstar product is '${heroProduct}'. Make sure you have enough stock!`;

        setAiInsight(`${trendText} ${heroText}`);
    };

    if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;

    // --- FIX: නමක් නැති Payment Methods "Other" ලෙස නම් කිරීම ---
    const formattedPaymentStats = data.paymentStats.map(item => ({
        ...item,
        _id: item._id || "Other" // _id එක null නම් "Other" දාන්න
    }));

    return (
        <div className="p-6 bg-gray-100 min-h-screen animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Advanced Analytics & AI Insights</h2>

            {/* --- AI INSIGHT CARD --- */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg mb-8 flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                    <Sparkles size={32} className="text-yellow-300" />
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-1">AI Business Assistant Says:</h3>
                    <p className="text-indigo-100 text-lg leading-relaxed font-medium">
                        "{aiInsight}"
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. SALES TREND CHART */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} /> Last 7 Days Revenue
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.dailySales}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" tick={{fontSize: 12}} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="total" name="Sales (Rs)" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. TOP PRODUCTS CHART */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Award size={20} /> Top 5 Selling Items
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topItems} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="_id" type="category" width={100} tick={{fontSize: 12}} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="qty" name="Quantity Sold" fill="#82ca9d" barSize={20} radius={[0, 10, 10, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. PAYMENT METHOD PIE CHART (Updated Data) */}
                <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Payment Methods Overview</h3>
                    <div className="h-64 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={formattedPaymentStats} // මෙතනට අපි හදපු අලුත් variable එක දැම්මා
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                    label
                                >
                                    {formattedPaymentStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsDashboard;