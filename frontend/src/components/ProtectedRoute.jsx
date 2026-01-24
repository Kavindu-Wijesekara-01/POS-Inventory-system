import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    // 1. LocalStorage එකෙන් User විස්තර ගන්නවා
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // 2. User කෙනෙක් නැත්නම් (Login වෙලා නැත්නම්) -> Login පිටුවට යවන්න
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    // 3. User හිටියට, එයාට මේ පිටුවට එන්න අවසර නැත්නම් (Role එක ගැලපෙන්නේ නැත්නම්)
    // උදාහරණයක්: Staff කෙනෙක් Admin පිටුවට යන්න හැදුවොත් -> POS එකට යවන්න
    if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
        return <Navigate to="/pos" replace />;
    }

    // 4. ඔක්කොම හරි නම් අදාල පිටුව පෙන්වන්න
    return <Outlet />;
};

export default ProtectedRoute;