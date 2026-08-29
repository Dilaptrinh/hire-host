import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Typography, Grid, Spin } from 'antd'
import {
  UserOutlined,
  CloudServerOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import adminService from '../../api/adminService'
import { useTheme } from '../../contexts/ThemeContext'

const { Title } = Typography
const { useBreakpoint } = Grid

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, servers: 0, orders: 0, payments: 0 })
  const [loading, setLoading] = useState(true)
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, serversRes, ordersRes, paymentsRes] = await Promise.all([
          adminService.getAllUsers({ page: 0, size: 1 }),
          adminService.getAllServers({ page: 0, size: 1 }),
          adminService.getAllOrders({ page: 0, size: 1 }),
          adminService.getAllPayments({ page: 0, size: 1 }),
        ])
        setStats({
          users: usersRes.data.data?.totalElements || 0,
          servers: serversRes.data.data?.totalElements || 0,
          orders: ordersRes.data.data?.totalElements || 0,
          payments: paymentsRes.data.data?.totalElements || 0,
        })
      } catch {
        setStats({ users: 0, servers: 0, orders: 0, payments: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <Title level={isMobile ? 4 : 3} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', marginBottom: 24 }}>
        Admin Dashboard
      </Title>
      <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]}>
        <Col xs={12} lg={6}>
          <Card styles={{ body: { padding: isMobile ? 16 : 24 } }} style={{ borderRadius: 12, background: isDark ? '#1f1f1f' : '#fff' }}>
            <Statistic title="Người dùng" value={stats.users} prefix={<UserOutlined />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card styles={{ body: { padding: isMobile ? 16 : 24 } }} style={{ borderRadius: 12, background: isDark ? '#1f1f1f' : '#fff' }}>
            <Statistic title="Gói hosting" value={stats.servers} prefix={<CloudServerOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card styles={{ body: { padding: isMobile ? 16 : 24 } }} style={{ borderRadius: 12, background: isDark ? '#1f1f1f' : '#fff' }}>
            <Statistic title="Đơn hàng" value={stats.orders} prefix={<ShoppingCartOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card styles={{ body: { padding: isMobile ? 16 : 24 } }} style={{ borderRadius: 12, background: isDark ? '#1f1f1f' : '#fff' }}>
            <Statistic title="Thanh toán" value={stats.payments} prefix={<DollarOutlined />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
