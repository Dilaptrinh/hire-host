import { Card, Button, Typography, Grid, Alert } from 'antd'
import { CloudServerOutlined, GoogleOutlined, ToolOutlined } from '@ant-design/icons'
import { useTheme } from '../contexts/ThemeContext'
import { OAUTH2_URL } from '../config'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

export default function Login() {
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

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
            Đăng nhập bằng tài khoản Google để sử dụng dịch vụ
          </Text>
        </div>

        <Alert
          type="info"
          showIcon
          icon={<ToolOutlined />}
          message="Đăng ký tài khoản đang sửa chữa"
          description="Vui lòng đăng nhập bằng Google để tiếp tục."
          style={{ marginBottom: 24 }}
        />

        <a href={OAUTH2_URL} style={{ display: 'block', textDecoration: 'none' }}>
          <Button
            icon={<GoogleOutlined />}
            block
            size={isMobile ? 'middle' : 'large'}
            style={{
              borderRadius: 8,
              borderColor: isDark ? '#303030' : '#d9d9d9',
              color: isDark ? '#e8e8e8' : '#1a1a2e',
              background: isDark ? '#1f1f1f' : '#fff',
              height: 48,
            }}
          >
            Đăng nhập với Google
          </Button>
        </a>
      </Card>
    </div>
  )
}
