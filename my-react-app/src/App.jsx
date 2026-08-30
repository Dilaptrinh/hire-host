import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import Hosting from './pages/Hosting'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import OrderConfirm from './pages/OrderConfirm'
import OrderDetail from './pages/OrderDetail'
import Payment from './pages/Payment'
import PaymentCallback from './pages/PaymentCallback'
import OAuth2Callback from './pages/OAuth2Callback'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminServers from './pages/admin/Servers'
import AdminCategories from './pages/admin/Categories'
import AdminOrders from './pages/admin/Orders'
import AdminPayments from './pages/admin/Payments'
import UploadProject from './pages/UploadProject'
import Announcements from './pages/Announcements'
import AdminAnnouncements from './pages/admin/Announcements'
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Hosting />} />
        <Route path="/hosting" element={<Navigate to="/" replace />} />
        <Route path="/info" element={<Announcements />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/order/:planName" element={<OrderConfirm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/deployment' element={<UploadProject></UploadProject>}></Route>
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route 
          path="/dashboard"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route
          path="/me"
          element={<PrivateRoute><Profile /></PrivateRoute>}
        />
        <Route
          path="/order-detail/:id"
          element={<PrivateRoute><OrderDetail /></PrivateRoute>}
        />
        <Route
          path="/payment/:orderId"
          element={<PrivateRoute><Payment /></PrivateRoute>}
        />
        <Route
          path="/admin"
          element={<AdminRoute><AdminDashboard /></AdminRoute>}
        />
        <Route
          path="/admin/users"
          element={<AdminRoute><AdminUsers /></AdminRoute>}
        />
        <Route
          path="/admin/servers"
          element={<AdminRoute><AdminServers /></AdminRoute>}
        />
        <Route
          path="/admin/categories"
          element={<AdminRoute><AdminCategories /></AdminRoute>}
        />
        <Route
          path="/admin/orders"
          element={<AdminRoute><AdminOrders /></AdminRoute>}
        />
        <Route
          path="/admin/payments"
          element={<AdminRoute><AdminPayments /></AdminRoute>}
        />
        <Route
          path="/admin/announcements"
          element={<AdminRoute><AdminAnnouncements /></AdminRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}


