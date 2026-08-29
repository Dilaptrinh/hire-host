import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Table, Tag, Typography, Grid, Spin, Empty, Progress, Button, Space, message, Modal } from 'antd'
import {
  CloudServerOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  DollarOutlined as DollarIcon,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import orderService from '../api/orderService'
import { useTheme } from '../contexts/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getAllMine({ page: 0, size: 10, sort: ['createdAt,desc'] })
        setOrders(res.data.data.content || [])
      } catch {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)

  const statusColors = {
    PENDING: 'gold', ACTIVE: 'green', CANCELLED: 'red', EXPIRED: 'default',
  }

  const statusLabels = {
    PENDING: 'Chờ thanh toán', ACTIVE: 'Hoạt động', CANCELLED: 'Đã hủy', EXPIRED: 'Hết hạn',
  }

  const totalOrders = orders.length
  const activeOrders = orders.filter((o) => o.status === 'ACTIVE').length
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)

  const handleCancel = (id) => {
    Modal.confirm({
      title: 'Hủy đơn hàng',
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      okText: 'Hủy đơn', okType: 'danger', cancelText: 'Quay lại',
      onOk: async () => {
        try {
          const res = await orderService.cancel(id)
          message.success('Đã hủy đơn hàng')
          setOrders((prev) => prev.map((o) => o.id === id ? res.data.data : o))
        } catch (err) { message.error(err.response?.data?.message || 'Hủy thất bại') }
      },
    })
  }

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: (id) => <Text style={{ color: '#1677ff', fontWeight: 600 }}>#{id}</Text> },
    { title: 'Gói', dataIndex: 'serverName', key: 'serverName' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s) => <Tag color={statusColors[s] || 'default'}>{statusLabels[s] || s}</Tag>,
    },
    { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate', responsive: ['md'] },
    { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate', responsive: ['md'] },
    {
      title: 'Tổng tiền', dataIndex: 'totalPrice', key: 'totalPrice',
      render: (p) => <Text strong style={{ color: '#1677ff' }}>{formatPrice(p)}₫</Text>,
    },
    {
      title: '', key: 'actions',
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/order-detail/${record.id}`)} />
          {record.status === 'PENDING' && (
            <>
              <Button size="small" type="primary" icon={<DollarIcon />} onClick={() => navigate(`/payment/${record.id}`)}>
                {!isMobile && 'Thanh toán'}
              </Button>
              <Button size="small" icon={<CloseCircleOutlined />} danger onClick={() => handleCancel(record.id)} />
            </>
          )}
        </Space>
      ),
    },
  ]

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <Title level={isMobile ? 4 : 3} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', marginBottom: isMobile ? 16 : 24 }}>
        Dashboard
      </Title>

      <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]}>
        <Col xs={12} sm={12} lg={6}>
          <Card styles={{ body: { padding: isMobile ? 16 : 24 } }} style={{ borderRadius: 12, background: isDark ? '#1f1f1f' : '#fff' }}>
            <Statistic title="Tổng đơn hàng" value={totalOrders} prefix={<ShoppingCartOutlined />} valueStyle={{ color: '#1677ff', fontSize: isMobile ? 22 : undefined }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card styles={{ body: { padding: isMobile ? 16 : 24 } }} style={{ borderRadius: 12, background: isDark ? '#1f1f1f' : '#fff' }}>
            <Statistic title="Đang hoạt động" value={activeOrders} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a', fontSize: isMobile ? 22 : undefined }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card styles={{ body: { padding: isMobile ? 16 : 24 } }} style={{ borderRadius: 12, background: isDark ? '#1f1f1f' : '#fff' }}>
            <Statistic title="Chờ thanh toán" value={pendingOrders} prefix={<CloudServerOutlined />} valueStyle={{ color: '#faad14', fontSize: isMobile ? 22 : undefined }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card styles={{ body: { padding: isMobile ? 16 : 24 } }} style={{ borderRadius: 12, background: isDark ? '#1f1f1f' : '#fff' }}>
            <Statistic title="Đã chi" value={formatPrice(totalSpent)} prefix={<DollarOutlined />} valueStyle={{ color: '#722ed1', fontSize: isMobile ? 16 : undefined }} />
          </Card>
        </Col>
      </Row>

      <Card
        title="Đơn hàng của bạn"
        styles={{ body: { padding: isMobile ? 0 : 24 } }}
        style={{ marginTop: isMobile ? 12 : 24, borderRadius: 12, background: isDark ? '#1f1f1f' : '#fff' }}
      >
        {orders.length === 0 ? (
          <Empty description={<span>Chưa có đơn hàng nào. <Button type="link" onClick={() => navigate('/hosting')}>Mua ngay</Button></span>} />
        ) : (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={false}
            scroll={{ x: isMobile ? 700 : undefined }}
            size={isMobile ? 'small' : 'middle'}
            style={{ background: 'transparent' }}
          />
        )}
      </Card>

      {orders.length > 0 && (
        <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]} style={{ marginTop: isMobile ? 12 : 24 }}>
          <Col xs={24} lg={12}>
            <Card
              title="Phân bố trạng thái"
              styles={{ body: { padding: isMobile ? 16 : 24 } }}
              style={{ borderRadius: 12, background: isDark ? '#1f1f1f' : '#fff' }}
            >
              {orders.map((order) => (
                <div key={order.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, color: isDark ? '#ccc' : '#4a4a4a' }}>{order.serverName}</Text>
                    <Text style={{ fontSize: 13, color: isDark ? '#ccc' : '#4a4a4a' }}>{formatPrice(order.totalPrice)}₫</Text>
                  </div>
                  <Progress
                    percent={order.status === 'ACTIVE' ? 100 : order.status === 'PENDING' ? 50 : 0}
                    strokeColor={statusColors[order.status] || '#1677ff'}
                    size={isMobile ? 'small' : undefined}
                    showInfo={false}
                  />
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}
