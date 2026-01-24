import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import POSPage from './pages/POSPage';
import PaymentPage from './pages/PaymentPage'; 

// Components
import StaffManagement from './components/StaffManagement';
import CategoryManagement from './components/CategoryManagement';
import ProductManagement from './components/ProductManagement';
import LoyaltyManagement from './components/LoyaltyManagement';
import SalesManagement from './components/SalesManagement';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ShopSettings from './components/ShopSettings';
import ProtectedRoute from './components/ProtectedRoute'; // <--- අලුත් එක Import කළා

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route (ඕනම කෙනෙක්ට යන්න පුළුවන්) */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* --- PROTECTED: ADMIN ONLY --- */}
        {/* මෙතනින් කියන්නේ 'admin' ලට විතරයි මේ ඇතුලේ තියෙන ඒවාට යන්න පුළුවන් */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />}>
                <Route index element={<Navigate to="staff" />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="loyalty" element={<LoyaltyManagement />} />
                <Route path="sales" element={<SalesManagement />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="settings" element={<ShopSettings />} />
            </Route>
        </Route>

        {/* --- PROTECTED: STAFF & ADMIN --- */}
        {/* POS එකට Admin සහ Staff දෙගොල්ලොන්ටම යන්න පුළුවන් වෙන්න ඕන */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/pos" element={<POSPage />} />
            <Route path="/payment" element={<PaymentPage />} />
        </Route>

        {/* වැරදි URL එකක් ගැහුවොත් Login එකට යවන්න */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;