import { useEffect, useState } from 'react'
import { Card, Col, Row, Button, Typography, Grid, Spin, Empty } from 'antd'
import { CheckOutlined, ArrowRightOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import serverService from '../api/serverService'
import { useTheme } from '../contexts/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const colors = ['#52c41a', '#1677ff', '#722ed1', '#eb2f96', '#fa8c16', '#13c2c2']

export default function Hosting() {
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const navigate = useNavigate()

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await serverService.getAll({ page: 0, size: 20 })
        setServers(res.data.data.content || [])
      } catch {
        setServers([])
      } finally {
        setLoading(false)
      }
    }
    fetchServers()
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (servers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Empty description="Không có gói hosting nào" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ textAlign: 'center', padding: isMobile ? '24px 0 12px' : '40px 0 20px' }}>
        <Title level={isMobile ? 3 : 2} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
          Gói Hosting
        </Title>
        <Text style={{ fontSize: isMobile ? 14 : 16, color: isDark ? '#8c8c8c' : '#6b7280' }}>
          Chọn gói phù hợp với nhu cầu của bạn
        </Text>
      </div>

      <Row gutter={[16, 16]} justify="center" style={{ marginTop: isMobile ? 12 : 24 }}>
        {servers.map((server, i) => {
          const color = colors[i % colors.length]
          const features = [
            `CPU: ${server.cpu}`,
            `RAM: ${server.ram}`,
            `Storage: ${server.storage}`,
            `Bandwidth: ${server.bandwidth}`,
          ]

          return (
            <Col xs={24} md={8} lg={6} key={server.id}>
              <Card
                hoverable
                styles={{ body: { padding: isMobile ? 20 : 32 } }}
                style={{
                  borderRadius: 16,
                  position: 'relative',
                  overflow: 'hidden',
                  background: isDark ? '#1f1f1f' : '#fff',
                  border: i === 1 ? `2px solid ${color}` : `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
                  transform: !isMobile && i === 1 ? 'scale(1.02)' : 'none',
                }}
              >
                {i === 1 && (
                  <div style={{
                    position: 'absolute',
                    top: isMobile ? 10 : 16,
                    right: isMobile ? -36 : -32,
                    background: color,
                    color: '#fff',
                    padding: isMobile ? '3px 36px' : '4px 40px',
                    transform: 'rotate(45deg)',
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                    PHỔ BIẾN
                  </div>
                )}

                {server.categoryName && (
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, color: color, fontWeight: 600, textTransform: 'uppercase' }}>
                      {server.categoryName}
                    </Text>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: isMobile ? 16 : 24 }}>
                  <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
                    {server.name}
                  </Title>
                  <div style={{ margin: '12px 0' }}>
                    <Text style={{ fontSize: isMobile ? 30 : 40, fontWeight: 700, color }}>
                      {formatPrice(server.price)}₫
                    </Text>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280' }}>/ngày</Text>
                  </div>
                  <Text style={{ fontSize: isMobile ? 13 : 14, color: isDark ? '#8c8c8c' : '#6b7280' }}>
                    {server.description}
                  </Text>
                </div>

                <div style={{
                  borderTop: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
                  paddingTop: isMobile ? 16 : 20,
                }}>
                  {features.map((feat, j) => (
                    <div key={j} style={{
                      padding: isMobile ? '6px 0' : '8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <CheckOutlined style={{ color, fontSize: 13 }} />
                      <Text style={{ fontSize: isMobile ? 13 : 14, color: isDark ? '#ccc' : '#4a4a4a' }}>
                        {feat}
                      </Text>
                    </div>
                  ))}
                </div>

                <Button
                  type={i === 1 ? 'primary' : 'default'}
                  size={isMobile ? 'middle' : 'large'}
                  block
                  icon={<ShoppingCartOutlined />}
                  style={{ marginTop: isMobile ? 16 : 24, borderRadius: 8 }}
                  onClick={() => navigate(`/order/${server.name.toLowerCase().replace(/\s+/g, '-')}`, { state: { server } })}
                >
                  Đăng ký ngay <ArrowRightOutlined />
                </Button>
              </Card>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}
