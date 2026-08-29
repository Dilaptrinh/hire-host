import { useState } from 'react'
import { Card, Form, Input, Button, Typography, message, Grid } from 'antd'
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined, CloudServerOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

export default function Register() {
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const result = await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      })
      if (result.success) {
        message.success('Đăng ký thành công!')
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
            Đăng ký
          </Title>
          <Text style={{ fontSize: isMobile ? 13 : 14, color: isDark ? '#8c8c8c' : '#6b7280' }}>
            Tạo tài khoản để quản lý hosting
          </Text>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ tên" size={isMobile ? 'middle' : 'large'} />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size={isMobile ? 'middle' : 'large'} />
          </Form.Item>

          <Form.Item name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại (không bắt buộc)" size={isMobile ? 'middle' : 'large'} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size={isMobile ? 'middle' : 'large'} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('Mật khẩu không khớp'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size={isMobile ? 'middle' : 'large'} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size={isMobile ? 'middle' : 'large'} loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: 13 }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: '#1677ff', fontWeight: 500 }}>
              Đăng nhập
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  )
}
