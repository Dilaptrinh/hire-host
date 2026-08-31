import { Button, Result, Grid } from 'antd'
import { ToolOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const { useBreakpoint } = Grid

export default function Register() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: 40 }}>
      <Result
        icon={<ToolOutlined style={{ color: '#faad14' }} />}
        title="Tính năng đang sửa chữa"
        subTitle="Chức năng đăng ký tài khoản đang được nâng cấp. Vui lòng đăng nhập bằng Google để tiếp tục sử dụng dịch vụ."
        style={{
          background: isDark ? '#1f1f1f' : '#fff',
          borderRadius: 16,
          padding: 40,
        }}
        extra={[
          <Button key="login" type="primary" size={isMobile ? 'middle' : 'large'} onClick={() => navigate('/login')}>
            Quay lại đăng nhập
          </Button>,
        ]}
      />
    </div>
  )
}
