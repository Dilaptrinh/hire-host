import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Typography, Spin, Button, Space, message, Divider, Grid, Empty } from 'antd'
import { ArrowLeftOutlined, ShoppingCartOutlined, DollarOutlined, CloseCircleOutlined } from '@ant-design/icons'
import orderService from '../api/orderService'
import paymentService from '../api/paymentService'
import { useTheme } from '../contexts/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const statusColors = { PENDING: 'gold', ACTIVE: 'green', CANCELLED: 'red', EXPIRED: 'default' }
const statusLabels = { PENDING: 'Chờ thanh toán', ACTIVE: 'Hoạt động', CANCELLED: 'Đã hủy', EXPIRED: 'Hết hạn' }

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [order, setOrder] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p)

  useEffect(() => {
    (async () => {
      try {
        const [orderRes, payRes] = await Promise.all([
          orderService.getById(id),
          paymentService.getAllMine(),
        ])
        setOrder(orderRes.data.data)
        const allPayments = payRes.data.data || []
        setPayments(allPayments.filter((p) => p.orderId === Number(id)))
      } catch {
        message.error('Không tìm thấy đơn hàng')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const handleCancel = async () => {
    try {
      const res = await orderService.cancel(id)
      setOrder(res.data.data)
      message.success('Đã hủy đơn hàng')
    } catch (err) {
      message.error(err.response?.data?.message || 'Hủy thất bại')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!order) return <Empty description="Không tìm thấy đơn hàng" />

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} style={{ marginBottom: 16 }}>
        Quay lại Dashboard
      </Button>

      <Card styles={{ body: { padding: isMobile ? 20 : 32 } }} style={{ borderRadius: 12, background: isDark ? '#1f1f1f' : '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
              <ShoppingCartOutlined /> Đơn hàng #{order.id}
            </Title>
            <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: 13 }}>Chi tiết đơn hàng thuê hosting</Text>
          </div>
          <Tag color={statusColors[order.status] || 'default'} style={{ padding: '4px 12px', fontSize: 13 }}>
            {statusLabels[order.status] || order.status}
          </Tag>
        </div>

        <Descriptions column={isMobile ? 1 : 2} size={isMobile ? 'small' : 'default'} bordered
          styles={{
            label: { color: isDark ? '#8c8c8c' : '#6b7280' },
            content: { color: isDark ? '#e8e8e8' : '#1a1a2e' },
          }}
        >
          <Descriptions.Item label="Gói dịch vụ" span={2}>{order.serverName}</Descriptions.Item>
          <Descriptions.Item label="Mã server">#{order.serverId}</Descriptions.Item>
          <Descriptions.Item label="Mã người dùng">#{order.userId}</Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">{order.startDate}</Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc">{order.endDate}</Descriptions.Item>
          <Descriptions.Item label="Tổng tiền" span={2}>
            <Text strong style={{ fontSize: 18, color: '#1677ff' }}>{formatPrice(order.totalPrice)}₫</Text>
          </Descriptions.Item>
        </Descriptions>

        {order.status === 'PENDING' && (
          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button type="primary" icon={<DollarOutlined />} size="large" onClick={() => navigate(`/payment/${order.id}`)}>
              Thanh toán ngay
            </Button>
            <Button icon={<CloseCircleOutlined />} size="large" onClick={handleCancel}>
              Hủy đơn hàng
            </Button>
          </div>
        )}

        {payments.length > 0 && (
          <>
            <Divider />
            <Title level={5} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', marginBottom: 12 }}>
              Lịch sử thanh toán
            </Title>
            {payments.map((pay) => (
              <Card key={pay.id} size="small" style={{ marginBottom: 8, background: isDark ? '#141414' : '#f9fafb' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }} align="start">
                  <div>
                    <Text style={{ fontSize: 12, color: '#8c8c8c' }}>GD #{pay.id}</Text>
                    <div>
                      <Text strong style={{ color: '#52c41a' }}>+{formatPrice(pay.amount)}₫</Text>
                      <Text style={{ color: '#8c8c8c', marginLeft: 8, fontSize: 13 }}>qua {pay.method}</Text>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Tag color={pay.status === 'COMPLETED' ? 'green' : 'gold'}>
                      {pay.status === 'COMPLETED' ? 'Hoàn tất' : pay.status}
                    </Tag>
                    {pay.paidAt && (
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c' }}>{new Date(pay.paidAt).toLocaleString('vi-VN')}</Text></div>
                    )}
                  </div>
                </Space>
              </Card>
            ))}
          </>
        )}
      </Card>
    </div>
  )
}
