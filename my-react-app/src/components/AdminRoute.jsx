import { Navigate } from 'react-router-dom'
import { Spin, Result, Button } from 'antd'
import { useAuth } from '../contexts/AuthContext'

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, initializing } = useAuth()

  if (initializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (!isAdmin) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này"
        extra={<Button type="primary" onClick={() => window.location.href = '/'}>Về trang chủ</Button>}
      />
    )
  }

  return children
}
