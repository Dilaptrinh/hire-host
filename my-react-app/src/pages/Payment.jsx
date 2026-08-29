import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Select, InputNumber, Button, Typography, message, Descriptions, Tag, Spin, Result, Grid } from 'antd'
import { DollarOutlined, ArrowLeftOutlined, WalletOutlined } from '@ant-design/icons'
import orderService from '../api/orderService'
import paymentService from '../api/paymentService'
import { useTheme } from '../contexts/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const paymentMethods = [
  { value: 'BANKING', label: 'Chuyển khoản ngân hàng' },
  { value: 'MOMO', label: 'Ví MoMo' },
  { value: 'VNPAY', label: 'VNPay' },
  { value: 'CASH', label: 'Tiền mặt' },
]

export default function Payment() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const [form] = Form.useForm()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p)

  useEffect(() => {
    (async () => {
      try {
        const res = await orderService.getById(orderId)
        setOrder(res.data.data)
        form.setFieldsValue({ orderId: res.data.data.id, amount: res.data.data.totalPrice })
      } catch {
        message.error('Không tìm thấy đơn hàng')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [orderId])

  const onFinish = async (values) => {
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        returnUrl: window.location.origin + '/payment/callback',
      }
      const res = await paymentService.create(payload)
      const payment = res.data.data

      if (payment.paymentUrl && (values.method === 'MOMO' || values.method === 'VNPAY')) {
        window.location.href = payment.paymentUrl
        return
      }

      setResult(payment)
      message.success('Thanh toán thành công!')
    } catch (error) {
      message.error(error.response?.data?.message || 'Thanh toán thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!order) return null

  if (result) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Card styles={{ body: { padding: isMobile ? 24 : 40 } }} style={{ borderRadius: 16, background: isDark ? '#1f1f1f' : '#fff' }}>
          <Result
            status="success"
            title="Thanh toán thành công!"
            subTitle={`Giao dịch #${result.id} - ${formatPrice(result.amount)}₫`}
            extra={[
              <Button key="dash" type="primary" onClick={() => navigate('/dashboard')}>Về Dashboard</Button>,
              <Button key="hosting" onClick={() => navigate('/hosting')}>Tiếp tục mua</Button>,
            ]}
          />
          <Card size="small" style={{ background: isDark ? '#141414' : '#f9fafb' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Mã giao dịch"><Text copyable>#{result.id}</Text></Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng">#{result.orderId}</Descriptions.Item>
              <Descriptions.Item label="Số tiền">{formatPrice(result.amount)}₫</Descriptions.Item>
              <Descriptions.Item label="Phương thức">{paymentMethods.find((m) => m.value === result.method)?.label || result.method}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag color="green">Hoàn tất</Tag></Descriptions.Item>
              {result.paidAt && <Descriptions.Item label="Thời gian">{new Date(result.paidAt).toLocaleString('vi-VN')}</Descriptions.Item>}
            </Descriptions>
          </Card>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card styles={{ body: { padding: isMobile ? 24 : 40 } }} style={{ borderRadius: 16, background: isDark ? '#1f1f1f' : '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <WalletOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 12 }} />
          <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
            Thanh toán đơn hàng
          </Title>
        </div>

        <Card size="small" style={{ marginBottom: 24, background: isDark ? '#141414' : '#f9fafb' }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Mã đơn hàng"><Text copyable>#{order.id}</Text></Descriptions.Item>
            <Descriptions.Item label="Gói">{order.serverName}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">{order.startDate} → {order.endDate}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color="gold">Chờ thanh toán</Tag></Descriptions.Item>
          </Descriptions>
        </Card>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="orderId" hidden><InputNumber /></Form.Item>
          <Form.Item name="amount" label="Số tiền" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập số tiền"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              size={isMobile ? 'middle' : 'large'}
              disabled
            />
          </Form.Item>
          <Form.Item name="method" label="Phương thức thanh toán" rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}>
            <Select placeholder="Chọn phương thức" size={isMobile ? 'middle' : 'large'} options={paymentMethods} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size={isMobile ? 'middle' : 'large'} loading={submitting} icon={<DollarOutlined />}>
              Xác nhận thanh toán
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>Quay lại Dashboard</Button>
        </div>
      </Card>
    </div>
  )
}
