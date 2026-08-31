import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Select, InputNumber, Button, Typography, message, Descriptions, Tag, Spin, Result, Grid, Space, Alert } from 'antd'
import { DollarOutlined, ArrowLeftOutlined, WalletOutlined, QrcodeOutlined, CheckCircleFilled, LoadingOutlined } from '@ant-design/icons'
import orderService from '../api/orderService'
import paymentService from '../api/paymentService'
import { useTheme } from '../contexts/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const paymentMethods = [
  { value: 'PAYOS', label: 'PayOS' },
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
  const [confirmed, setConfirmed] = useState(false)

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

  // Poll để phát hiện khi PayOS webhook xác nhận thanh toán thành công
  useEffect(() => {
    if (!result || result.method !== 'PAYOS') return
    const poll = setInterval(async () => {
      try {
        const res = await paymentService.getAllMine()
        const list = res.data.data || []
        const latest = list[0]
        if (latest && (latest.status === 'SUCCESS' || latest.status === 'COMPLETED')) {
          setConfirmed(true)
          clearInterval(poll)
        }
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(poll)
  }, [result])

  const onFinish = async (values) => {
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        returnUrl: window.location.origin + '/payment/callback',
      }
      const res = await paymentService.create(payload)
      setResult(res.data.data)
    } catch (error) {
      message.error(error.response?.data?.message || 'Thanh toán thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!order) return null

  if (result) {
    if (confirmed) {
      return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Card styles={{ body: { padding: isMobile ? 24 : 40 } }} style={{ borderRadius: 16, background: isDark ? '#1f1f1f' : '#fff' }}>
            <Result
              status="success"
              icon={<CheckCircleFilled style={{ color: '#52c41a', fontSize: 64 }} />}
              title="Thanh toán thành công!"
              subTitle={`Giao dịch #${result.id} - ${formatPrice(result.amount)}₫`}
              extra={[
                <Button key="dash" type="primary" onClick={() => navigate('/dashboard')}>Về Dashboard</Button>,
                <Button key="hosting" onClick={() => navigate('/hosting')}>Tiếp tục mua</Button>,
              ]}
            />
          </Card>
        </div>
      )
    }

    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Card styles={{ body: { padding: isMobile ? 24 : 32 } }} style={{ borderRadius: 16, background: isDark ? '#1f1f1f' : '#fff', textAlign: 'center' }}>
          <QrcodeOutlined style={{ fontSize: 44, color: '#1677ff', marginBottom: 12 }} />
          <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
            Quét mã QR để thanh toán
          </Title>
          <Text type="secondary">Mở ứng dụng ngân hàng hoặc ví điện tử quét mã dưới đây</Text>

          <div style={{ margin: '24px auto', display: 'flex', justifyContent: 'center' }}>
            {result.qrCode ? (
              <img
                src={result.qrCode}
                alt="QR thanh toán PayOS"
                style={{ width: 220, height: 220, borderRadius: 12, border: `1px solid ${isDark ? '#303030' : '#e5e7eb'}`, background: '#fff' }}
              />
            ) : (
              <Spin size="large" />
            )}
          </div>

          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Text strong style={{ fontSize: 22, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
              {formatPrice(result.amount)} ₫
            </Text>
            <Alert
              type="info"
              showIcon
              icon={<LoadingOutlined />}
              message="Đang chờ xác nhận thanh toán..."
              description="Trang sẽ tự cập nhật khi giao dịch được xác nhận."
            />
            <Button type="primary" block size="large" icon={<WalletOutlined />}
              onClick={() => result.paymentUrl && window.open(result.paymentUrl, '_blank')}>
              Mở trang thanh toán PayOS
            </Button>
            <Button block onClick={() => navigate('/dashboard')}>Quay lại Dashboard</Button>
          </Space>
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
