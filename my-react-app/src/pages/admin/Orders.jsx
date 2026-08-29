import { useEffect, useState } from 'react'
import { Table, Tag, Typography, Grid, Spin, message } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import adminService from '../../api/adminService'
import { useTheme } from '../../contexts/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const statusColors = { PENDING: 'gold', ACTIVE: 'green', CANCELLED: 'red', EXPIRED: 'default' }
const statusLabels = { PENDING: 'Chờ thanh toán', ACTIVE: 'Hoạt động', CANCELLED: 'Đã hủy', EXPIRED: 'Hết hạn' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await adminService.getAllOrders({ page, size: 10, sort: ['id,desc'] })
        setOrders(res.data.data.content || [])
        setTotal(res.data.data.totalElements || 0)
      } catch { message.error('Không thể tải đơn hàng')
      } finally { setLoading(false) }
    }
    fetchOrders()
  }, [page])

  const columns = [
    { title: 'Mã ĐH', dataIndex: 'id', key: 'id', width: 80, render: (id) => <Text copyable>#{id}</Text> },
    { title: 'Người dùng', dataIndex: 'userId', key: 'userId', render: (uid) => `#${uid}` },
    { title: 'Gói', dataIndex: 'serverName', key: 'serverName' },
    { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate', responsive: ['md'] },
    { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate', responsive: ['md'] },
    { title: 'Tổng tiền', dataIndex: 'totalPrice', key: 'totalPrice', render: (p) => <Text strong style={{ color: '#1677ff' }}>{formatPrice(p)}₫</Text> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s] || 'default'}>{statusLabels[s] || s}</Tag> },
  ]

  if (loading && orders.length === 0) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <Title level={isMobile ? 4 : 3} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', marginBottom: 16 }}>
        <ShoppingCartOutlined /> Quản lý đơn hàng
      </Title>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        scroll={{ x: isMobile ? 700 : undefined }}
        size={isMobile ? 'small' : 'middle'}
        pagination={{ current: page + 1, total, pageSize: 10, onChange: (p) => setPage(p - 1) }}
      />
    </div>
  )
}
