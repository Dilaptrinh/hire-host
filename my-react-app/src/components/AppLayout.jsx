import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Switch, Avatar, Dropdown, Space, Typography, Drawer, Grid } from 'antd'
import {
  HomeOutlined,
  CloudServerOutlined,
  InfoCircleOutlined,
  DashboardOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
  PhoneOutlined,
  ProfileOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  CrownOutlined,
  DollarOutlined,
  TeamOutlined,
  SettingOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

const { Header, Content, Footer } = Layout
const { Text } = Typography
const { useBreakpoint } = Grid

const publicMenuItems = [
  { key: '/', icon: <HomeOutlined />, label: 'Trang chủ' },
  { key: '/info', icon: <ProfileOutlined />, label: 'Thông tin' },
  { key: '/about', icon: <InfoCircleOutlined />, label: 'Giới thiệu' },
  { key: '/contact', icon: <PhoneOutlined />, label: 'Liên hệ' },
  { key: '/deployment', icon: <CloudUploadOutlined/>, label: 'Triển khai web tĩnh'}
]

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [siderCollapsed, setSiderCollapsed] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const prevIsMobile = useRef(isMobile)
  useEffect(() => {
    if (prevIsMobile.current && !isMobile) setMobileMenuOpen(false)
    prevIsMobile.current = isMobile
  }, [isMobile])

  const getSelectedKey = () => {
    const path = location.pathname
    if (path.startsWith('/admin')) return '/admin'
    if (path.startsWith('/dashboard')) return '/dashboard'
    if (path.startsWith('/order')) return '/'
    if (path.startsWith('/payment')) return '/dashboard'
    if (path.startsWith('/order-detail')) return '/dashboard'
    return path
  }

  const menuItems = [
    ...publicMenuItems,
    ...(isAuthenticated
      ? [
        { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/me', icon: <ProfileOutlined />, label: 'Tài khoản' },
      ]
      : []),
    ...(isAdmin
      ? [
        { type: 'divider' },
        { key: 'admin-group', icon: <SettingOutlined />, label: 'Quản trị', disabled: true },
        { key: '/admin', icon: <CrownOutlined />, label: 'Dashboard' },
        { key: '/admin/users', icon: <TeamOutlined />, label: 'Người dùng' },
        { key: '/admin/servers', icon: <CloudServerOutlined />, label: 'Gói hosting' },
        { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Danh mục' },
        { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: 'Đơn hàng' },
        { key: '/admin/payments', icon: <DollarOutlined />, label: 'Thanh toán' },
      ]
      : []),
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.fullName || user?.email || 'User',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'me',
      icon: <ProfileOutlined />,
      label: 'Thông tin',
      onClick: () => navigate('/me'),
    },
    ...(isAdmin ? [{
      key: 'admin',
      icon: <CrownOutlined />,
      label: 'Quản trị',
      onClick: () => navigate('/admin'),
    }] : []),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => { logout(); navigate('/') },
    },
  ]

  const onMenuClick = ({ key }) => {
    if (key === 'admin-group') return
    navigate(key)
    if (isMobile) setMobileMenuOpen(false)
  }

  const renderMenu = (themeMode) => (
    <Menu
      theme={themeMode}
      mode="inline"
      selectedKeys={[getSelectedKey()]}
      items={menuItems}
      onClick={onMenuClick}
    />
  )

  const renderLogo = (showText) => (
    <div style={{
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
      cursor: 'pointer',
    }} onClick={() => navigate('/')}>
      <CloudServerOutlined style={{ fontSize: 28, color: '#1677ff' }} />
      {showText && (
        <Text strong style={{ marginLeft: 10, fontSize: 18, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
          HireHost
        </Text>
      )}
    </div>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Layout.Sider
          trigger={null}
          collapsible
          collapsed={siderCollapsed}
          theme={isDark ? 'dark' : 'light'}
          width={220}
          style={{
            borderRight: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
          }}
        >
          {renderLogo(!siderCollapsed)}
          {renderMenu(isDark ? 'dark' : 'light')}
        </Layout.Sider>
      )}

      <Drawer
        title={
          <Space>
            <CloudServerOutlined style={{ fontSize: 22, color: '#1677ff' }} />
            <Text strong style={{ fontSize: 16 }}>HireHost</Text>
          </Space>
        }
        placement="left"
        closable
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        {renderMenu(isDark ? 'dark' : 'light')}
      </Drawer>

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDark ? '#141414' : '#fff',
            borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
          }}
        >
          <Space>
            {isMobile ? (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileMenuOpen(true)} />
            ) : (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setSiderCollapsed(!siderCollapsed)} />
            )}
            {isMobile && (
              <Space>
                <CloudServerOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                <Text strong style={{ fontSize: 16, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>HireHost</Text>
              </Space>
            )}
          </Space>

          <Space size="small">
            <Space size={4}>
              <SunOutlined style={{ fontSize: 12, color: isDark ? '#8c8c8c' : '#faad14' }} />
              <Switch size="small" checked={isDark} onChange={toggleTheme} />
              <MoonOutlined style={{ fontSize: 12, color: isDark ? '#1677ff' : '#8c8c8c' }} />
            </Space>

            {isAuthenticated ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Avatar
                  size={32}
                  style={{ backgroundColor: '#1677ff', cursor: 'pointer' }}
                  icon={<UserOutlined />}
                />
              </Dropdown>
            ) : (
              <Button type="primary" size="small" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                {!isMobile && 'Đăng nhập'}
              </Button>
            )}
          </Space>
        </Header>

        <Content style={{ padding: isMobile ? 16 : 24 }}>
          <Outlet />
        </Content>

        <Footer style={{
          textAlign: 'center',
          padding: isMobile ? '12px 16px' : '24px 50px',
          background: isDark ? '#141414' : '#fafafa',
          color: isDark ? '#8c8c8c' : '#8c8c8c',
          borderTop: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
          fontSize: isMobile ? 13 : 14,
        }}>
          HireHost ©2026 - Thuê hosting chất lượng cao
        </Footer>
      </Layout>
    </Layout>
  )
}
