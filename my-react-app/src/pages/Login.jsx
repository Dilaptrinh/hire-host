import { useState } from 'react'
import { Card, Form, Input, Button, Typography, message, Grid, Divider } from 'antd'
import { MailOutlined, LockOutlined, CloudServerOutlined, GoogleOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { OAUTH2_URL } from '../config'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

export default function Login() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const result = await login(values.email, values.password)
      if (result.success) {
        message.success('Đăng nhập thành công!')
        navigate('/dashboard')
      } else {
        message.error(result.message)
      }
    } catch {
      message.error('Đã có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '70vh',
      padding: isMobile ? 16 : 0,
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.08)',
          background: isDark ? '#1f1f1f' : '#fff',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 32 }}>
          <CloudServerOutlined style={{ fontSize: isMobile ? 36 : 48, color: '#1677ff', marginBottom: 12 }} />
          <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
            Đăng nhập
          </Title>
          <Text style={{ fontSize: isMobile ? 13 : 14, color: isDark ? '#8c8c8c' : '#6b7280' }}>
            Đăng nhập để quản lý hosting của bạn
          </Text>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size={isMobile ? 'middle' : 'large'} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size={isMobile ? 'middle' : 'large'} />
          </Form.Item>

          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <Divider style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: 13 }} plain>Hoặc</Divider>
          </div>

          <a href={OAUTH2_URL} style={{ marginBottom : '10px', display: 'block', textDecoration: 'none' }}>
            <Button
              icon={<GoogleOutlined />}
              block
              size={isMobile ? 'middle' : 'large'}
              style={{
                borderRadius: 8,
                borderColor: isDark ? '#303030' : '#d9d9d9',
                color: isDark ? '#e8e8e8' : '#1a1a2e',
                background: isDark ? '#1f1f1f' : '#fff',
              }}
            >
              Đăng nhập với Google
            </Button>
          </a>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size={isMobile ? 'middle' : 'large'} loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: 13 }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: '#1677ff', fontWeight: 500 }}>
              Đăng ký ngay
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  )
}
