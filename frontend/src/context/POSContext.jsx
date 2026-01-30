import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';

const POSContext = createContext();

export const POSProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [todaySales, setTodaySales] = useState(0);
    const [loading, setLoading] = useState(true);

    // Data Fetching Function
    const fetchData = async () => {
        // බඩු දැනටමත් තියෙනවා නම් ආයේ ගන්න එපා (Caching Logic) ⚡
        if (products.length > 0 && categories.length > 0) {
            setLoading(false);
            return; 
        }

        try {
            setLoading(true);
            const [catRes, prodRes, analyticsRes] = await Promise.all([
                axios.get('/inventory/categories'),
                axios.get('/inventory/products'),
                axios.get('/orders/analytics')
            ]);

            setCategories(catRes.data);
            setProducts(prodRes.data);

            const today = new Date().toISOString().split('T')[0];
            const todayData = analyticsRes.data.dailySales.find(d => d._id === today);
            setTodaySales(todayData ? todayData.total : 0);

            setLoading(false);
        } catch (error) {
            console.error("Error loading data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <POSContext.Provider value={{ products, categories, todaySales, loading, refreshData: fetchData }}>
            {children}
        </POSContext.Provider>
    );
};

// Hook එකක් විදියට export කරමු (ලේසියෙන් පාවිච්චි කරන්න)
export const usePOSData = () => useContext(POSContext);