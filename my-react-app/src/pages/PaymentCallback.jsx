import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin, Typography, Result, Button, Space, Grid } from 'antd'
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from '@ant-design/icons'
import paymentService from '../api/paymentService'
import { getAccessToken } from '../api/tokenStorage'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

export default function PaymentCallback() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { isAuthenticated } = useAuth()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const processed = useRef(false)

  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const params = new URLSearchParams(window.location.search)
    const resultCode = params.get('resultCode')
    const msg = params.get('message') || ''

    if (resultCode === '0') {
      setStatus('success')
      setMessage(msg || 'Thanh toán thành công!')
    } else {
      setStatus('fail')
      setMessage(msg || 'Thanh toán thất bại hoặc đã bị hủy')
    }

    const verifyPayment = async () => {
      if (!getAccessToken()) return

      try {
        const res = await paymentService.getAllMine()
        const payments = res.data.data || []
        const lastPayment = payments[0]

        if (!lastPayment) return

        if (lastPayment.status === 'SUCCESS' || lastPayment.status === 'COMPLETED') {
          setStatus('success')
          setMessage('Thanh toán đã được xác nhận!')
          return
        }

        if (lastPayment.status === 'FAILED') {
          setStatus('fail')
          setMessage('Thanh toán thất bại')
          return
        }

        if (lastPayment.status === 'PENDING') {
          setPolling(true)
          const poll = setInterval(async () => {
            try {
              const pollRes = await paymentService.getAllMine()
              const pollPayments = pollRes.data.data || []
              const latest = pollPayments[0]

              if (latest.status === 'SUCCESS' || latest.status === 'COMPLETED') {
                setStatus('success')
                setMessage('Thanh toán đã được xác nhận!')
                setPolling(false)
                clearInterval(poll)
              } else if (latest.status === 'FAILED') {
                setStatus('fail')
                setMessage('Thanh toán thất bại')
                setPolling(false)
                clearInterval(poll)
              }
            } catch {
              clearInterval(poll)
              setPolling(false)
            }
          }, 3000)
        }
      } catch {
        // ignore
      }
    }

    verifyPayment()
  }, [])

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        minHeight: '60vh', gap: 24,
      }}>
        <Spin size="large" />
        <Title level={isMobile ? 4 : 3} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', margin: 0 }}>
          Đang xử lý thanh toán...
        </Title>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <Result
        status={status === 'success' ? 'success' : 'error'}
        icon={status === 'success'
          ? <CheckCircleFilled style={{ color: '#52c41a', fontSize: 64 }} />
          : <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 64 }} />
        }
        title={status === 'success' ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
        subTitle={
          <Space direction="vertical" size={4}>
            <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280' }}>{message}</Text>
            {polling && (
              <Text style={{ color: '#1677ff' }}>
                <LoadingOutlined style={{ marginRight: 6 }} />Đang chờ xác nhận từ MoMo...
              </Text>
            )}
          </Space>
        }
        extra={[
          <Button key="dash" type="primary" size={isMobile ? 'middle' : 'large'} onClick={() => navigate('/dashboard')}>
            Về Dashboard
          </Button>,
          <Button key="orders" size={isMobile ? 'middle' : 'large'} onClick={() => navigate('/dashboard')}>
            Xem đơn hàng
          </Button>,
        ]}
      />
    </div>
  )
}
