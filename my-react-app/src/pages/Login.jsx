import { useState } from 'react'
import { Card, Button, Form, Input, Typography, Grid, Divider, Alert } from 'antd'
import {
  CloudServerOutlined,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { OAUTH2_URL } from '../config'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

export default function Login() {
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [error, setError] = useState('')

  const onFinish = async (values) => {
    setError('')
    const result = await login(values.email, values.password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  const cardColor = isDark ? '#1f1f1f' : '#fff'
  const textColor = isDark ? '#e8e8e8' : '#1a1a2e'
  const secondary = isDark ? '#8c8c8c' : '#6b7280'

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
          maxWidth: 440,
          borderRadius: 16,
          boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.08)',
          background: cardColor,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 24 }}>
          <CloudServerOutlined style={{ fontSize: isMobile ? 36 : 48, color: '#1677ff', marginBottom: 12 }} />
          <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: textColor }}>
            Đăng nhập
          </Title>
          <Text style={{ fontSize: isMobile ? 13 : 14, color: secondary }}>
            Sử dụng tài khoản email/mật khẩu hoặc Google
          </Text>
        </div>

        {error && (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError('')}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: secondary }} />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: secondary }} />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size={isMobile ? 'middle' : 'large'}
              style={{ height: 44, borderRadius: 8 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider plain style={{ color: secondary, fontSize: isMobile ? 12 : 13, margin: '12px 0 16px' }}>
          hoặc
        </Divider>

        <a href={OAUTH2_URL} style={{ display: 'block', textDecoration: 'none' }}>
          <Button
            icon={<GoogleOutlined />}
            block
            size={isMobile ? 'middle' : 'large'}
            style={{
              borderRadius: 8,
              borderColor: isDark ? '#303030' : '#d9d9d9',
              color: textColor,
              background: cardColor,
              height: 44,
            }}
          >
            Đăng nhập bằng Google
          </Button>
        </a>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text style={{ fontSize: isMobile ? 12 : 13, color: secondary }}>
            Chưa có tài khoản? Vui lòng đăng ký bằng Google ở trên.
          </Text>
        </div>
      </Card>
    </div>
  )
}
