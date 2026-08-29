import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, Button, Typography, Tag, Space, Grid, Result, DatePicker, Form, message, Descriptions, Radio, Divider } from 'antd'
import {
  CheckCircleOutlined,
  CloudServerOutlined,
  ArrowLeftOutlined,
  DashboardOutlined,
  CalendarOutlined,
  WalletOutlined,
  BankOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import orderService from '../api/orderService'
import paymentService from '../api/paymentService'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

export default function OrderConfirm() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { isAuthenticated } = useAuth()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const [form] = Form.useForm()

  const [submitting, setSubmitting] = useState(false)
  const [paying, setPaying] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('MOMO')

  const paymentMethods = [
    { value: 'MOMO', label: 'Ví MoMo', icon: <WalletOutlined /> },
    { value: 'VNPAY', label: 'VNPay', icon: <BankOutlined /> },
    { value: 'BANKING', label: 'Chuyển khoản ngân hàng', icon: <BankOutlined /> },
    { value: 'CASH', label: 'Tiền mặt', icon: <WalletOutlined /> },
  ]

  const handlePay = async () => {
    setPaying(true)
    try {
      const res = await paymentService.create({
        orderId: orderResult.id,
        amount: orderResult.totalPrice,
        method: paymentMethod,
        returnUrl: window.location.origin + '/payment/callback',
      })
      const payment = res.data.data
      if (payment.paymentUrl && (paymentMethod === 'MOMO' || paymentMethod === 'VNPAY')) {
        window.location.href = payment.paymentUrl
        return
      }
      message.success('Yêu cầu thanh toán đã được ghi nhận!')
    } catch (error) {
      message.error(error.response?.data?.message || 'Thanh toán thất bại')
    } finally {
      setPaying(false)
    }
  }

  const server = location.state?.server

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const handleDateChange = () => {
    const start = form.getFieldValue('startDate')
    const end = form.getFieldValue('endDate')
    if (start && end && server?.price) {
      const days = end.diff(start, 'day')
      if (days > 0) {
        const months = Math.ceil(days / 30)
        setTotalPrice(server.price * months)
      } else {
        setTotalPrice(server.price)
      }
    }
  }

  const onFinish = async (values) => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để đặt hàng')
      navigate('/login', { state: { from: location.pathname, server } })
      return
    }
    setSubmitting(true)
    try {
      const res = await orderService.create({
        serverId: server.id,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      })
      setOrderResult(res.data.data)
    } catch (error) {
      message.error(error.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  if (!server) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <Result
          status="warning"
          title="Không tìm thấy thông tin gói"
          subTitle="Vui lòng chọn gói hosting từ danh sách."
          extra={
            <Button type="primary" onClick={() => navigate('/hosting')}>
              Xem gói hosting
            </Button>
          }
        />
      </div>
    )
  }

  if (orderResult) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Card
          style={{
            borderRadius: 16,
            background: isDark ? '#1f1f1f' : '#fff',
            border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
          }}
          styles={{ body: { padding: isMobile ? 24 : 40 } }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
              Thanh toán đơn hàng
            </Title>
            <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', display: 'block', marginTop: 4 }}>
              Vui lòng thanh toán ngay để kích hoạt dịch vụ
            </Text>
          </div>

          <Descriptions
            column={1}
            size={isMobile ? 'small' : 'default'}
            styles={{
              label: { color: isDark ? '#8c8c8c' : '#6b7280' },
              content: { color: isDark ? '#e8e8e8' : '#1a1a2e' },
            }}
            bordered
          >
            <Descriptions.Item label="Mã đơn hàng">
              <Text copyable style={{ color: '#1677ff', fontWeight: 600 }}>#{orderResult.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Gói">{orderResult.serverName}</Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">{orderResult.startDate}</Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">{orderResult.endDate}</Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
                {formatPrice(orderResult.totalPrice)}₫
              </Text>
            </Descriptions.Item>
          </Descriptions>

          <Divider style={{ margin: '24px 0', borderColor: isDark ? '#303030' : '#f0f0f0' }} />

          <div style={{ marginBottom: 20 }}>
            <Title level={5} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', margin: '0 0 12px 0' }}>
              <WalletOutlined style={{ marginRight: 8 }} />Chọn phương thức thanh toán
            </Title>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {paymentMethods.map((m) => (
                  <Card
                    key={m.value}
                    size="small"
                    hoverable
                    style={{
                      cursor: 'pointer',
                      borderRadius: 10,
                      border: paymentMethod === m.value
                        ? '2px solid #1677ff'
                        : `1px solid ${isDark ? '#303030' : '#e8e8e8'}`,
                      background: paymentMethod === m.value
                        ? (isDark ? '#111d2e' : '#f0f5ff')
                        : (isDark ? '#1f1f1f' : '#fff'),
                    }}
                    onClick={() => setPaymentMethod(m.value)}
                  >
                    <Radio value={m.value} style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                      <Space>
                        {m.icon}
                        <Text strong style={{ color: isDark ? '#e8e8e8' : '#1a1a2e' }}>{m.label}</Text>
                      </Space>
                    </Radio>
                  </Card>
                ))}
              </Space>
            </Radio.Group>
          </div>

          <Button
            type="primary"
            block
            size={isMobile ? 'middle' : 'large'}
            loading={paying}
            icon={<WalletOutlined />}
            onClick={handlePay}
            style={{ height: 48, fontSize: 16, borderRadius: 10, marginBottom: 16 }}
          >
            Thanh toán {formatPrice(orderResult.totalPrice)}₫
          </Button>

          <Space style={{ width: '100%', justifyContent: 'center' }} size={12}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/hosting')}>
              Tiếp tục mua
            </Button>
            <Button icon={<DashboardOutlined />} onClick={() => navigate('/dashboard')}>
              Về Dashboard
            </Button>
          </Space>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <Card
        style={{
          borderRadius: 16,
          background: isDark ? '#1f1f1f' : '#fff',
          border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
        }}
        styles={{ body: { padding: isMobile ? 24 : 40 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <CloudServerOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 12 }} />
          <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
            Xác nhận đặt gói {server.name}
          </Title>
        </div>

        <div style={{
          background: isDark ? '#141414' : '#f9fafb',
          borderRadius: 12,
          padding: isMobile ? 16 : 24,
          marginBottom: 24,
        }}>
          <Descriptions
            column={1}
            size={isMobile ? 'small' : 'default'}
            styles={{
              label: { color: isDark ? '#8c8c8c' : '#6b7280' },
              content: { color: isDark ? '#e8e8e8' : '#1a1a2e' },
            }}
          >
            <Descriptions.Item label="Gói">{server.name}</Descriptions.Item>
            {server.categoryName && <Descriptions.Item label="Danh mục">{server.categoryName}</Descriptions.Item>}
            <Descriptions.Item label="CPU">{server.cpu}</Descriptions.Item>
            <Descriptions.Item label="RAM">{server.ram}</Descriptions.Item>
            <Descriptions.Item label="Storage">{server.storage}</Descriptions.Item>
            <Descriptions.Item label="Bandwidth">{server.bandwidth}</Descriptions.Item>
            <Descriptions.Item label="Giá">
              <Text strong style={{ fontSize: 16, color: '#1677ff' }}>
                {formatPrice(server.price)}₫<Text style={{ fontSize: 13, color: '#8c8c8c' }}>/tháng</Text>
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          onValuesChange={handleDateChange}
        >
          <Space size={isMobile ? 12 : 16} style={{ width: '100%' }} align="start">
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Chọn ngày"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                prefix={<CalendarOutlined />}
                size={isMobile ? 'middle' : 'large'}
              />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Chọn ngày"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                prefix={<CalendarOutlined />}
                size={isMobile ? 'middle' : 'large'}
              />
            </Form.Item>
          </Space>

          {totalPrice > 0 && (
            <div style={{
              background: isDark ? '#111d2e' : '#f0f5ff',
              borderRadius: 10,
              padding: isMobile ? 14 : 18,
              marginBottom: 24,
              textAlign: 'center',
            }}>
              <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: 13 }}>Tạm tính: </Text>
              <Text strong style={{ fontSize: 24, color: '#1677ff' }}>{formatPrice(totalPrice)}₫</Text>
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size={isMobile ? 'middle' : 'large'}
              loading={submitting}
              icon={<CheckCircleOutlined />}
            >
              Xác nhận đặt hàng
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/hosting')}>
            Quay lại danh sách gói
          </Button>
        </div>
      </Card>
    </div>
  )
}
