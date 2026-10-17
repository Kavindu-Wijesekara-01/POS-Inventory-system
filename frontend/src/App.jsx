import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { POSProvider } from './context/POSContext';

// ✅ 1. POS Page එක සාමාන්‍ය විදියට Import කරන්න (Fast Loading සඳහා)
import POSPage from './pages/POSPage';
import PaymentPage from './pages/PaymentPage'; 

// 💤 2. අනිත් බර දේවල් විතරක් Lazy Load කරන්න
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Admin Components (මේවා දිගටම Lazy තිබුනට කමක් නෑ)
const StaffManagement = lazy(() => import('./components/StaffManagement'));
const CategoryManagement = lazy(() => import('./components/CategoryManagement'));
const ProductManagement = lazy(() => import('./components/ProductManagement'));
const SalesManagement = lazy(() => import('./components/SalesManagement'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));

function App() {
  return (
    <POSProvider>
    <BrowserRouter>
      {/* Suspense එක තියෙන්නේ Lazy Load වෙන ඒවට විතරයි */}
      <Suspense 
        fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px', fontWeight: 'bold' }}>
            🚀 Loading System... Please Wait...
          </div>
        }
      >
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* --- PROTECTED: ADMIN ONLY --- */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
             <Route path="/admin-dashboard" element={<AdminDashboard />}>
                <Route index element={<Navigate to="staff" />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="sales" element={<SalesManagement />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
             </Route>
          </Route>

          {/* --- PROTECTED: STAFF & ADMIN --- */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
             {/* ✅ POS Page එක දැන් Normal නිසා Loading එන්නේ නෑ */}
             <Route path="/pos" element={<POSPage />} />
             <Route path="/payment" element={<PaymentPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
    </POSProvider>
  );
}

export default App;