import { Card, Row, Col, Typography, Space, Grid } from 'antd'
import {
  CloudServerOutlined,
  TeamOutlined,
  TrophyOutlined,
  HeartOutlined,
} from '@ant-design/icons'
import { useTheme } from '../contexts/ThemeContext'

const { Title, Paragraph } = Typography
const { useBreakpoint } = Grid

const values = [
  { icon: <CloudServerOutlined />, title: 'Công nghệ', desc: 'Hệ thống server hiện đại, SSD NVMe, băng thông 1Gbps' },
  { icon: <TeamOutlined />, title: 'Đội ngũ', desc: 'Kỹ sư giàu kinh nghiệm, hỗ trợ tận tâm 24/7' },
  { icon: <TrophyOutlined />, title: 'Chất lượng', desc: 'Cam kết uptime 99.9%, đền bù 10x khi vi phạm' },
  { icon: <HeartOutlined />, title: 'Khách hàng', desc: 'Hơn 15.000 khách hàng tin tưởng và sử dụng dịch vụ' },
]

export default function About() {
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: isMobile ? '20px 0' : '40px 0' }}>
        <CloudServerOutlined style={{ fontSize: isMobile ? 40 : 64, color: '#1677ff', marginBottom: 12 }} />
        <Title level={isMobile ? 3 : 2} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
          Về HireHost
        </Title>
        <Paragraph style={{
          fontSize: isMobile ? 14 : 16,
          color: isDark ? '#8c8c8c' : '#6b7280',
          maxWidth: 600,
          margin: '0 auto',
          padding: '0 16px',
        }}>
          HireHost là nền tảng cung cấp dịch vụ hosting hàng đầu, giúp hàng nghìn website
          vận hành ổn định, an toàn và tốc độ cao.
        </Paragraph>
      </div>

      <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]}>
        {values.map((val, i) => (
          <Col xs={24} md={8} lg={6} key={i}>
            <Card
              styles={{ body: { padding: isMobile ? 16 : 24 } }}
              style={{
                borderRadius: 12,
                background: isDark ? '#1f1f1f' : '#fff',
                border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
              }}
            >
              <Space size={isMobile ? 12 : 16} align="start">
                <div style={{
                  width: isMobile ? 44 : 56,
                  height: isMobile ? 44 : 56,
                  borderRadius: 12,
                  background: isDark ? '#1677ff1a' : '#f0f5ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? 20 : 24,
                  color: '#1677ff',
                  flexShrink: 0,
                }}>
                  {val.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Title level={isMobile ? 5 : 5} style={{ margin: 0, fontSize: isMobile ? 14 : 16, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
                    {val.title}
                  </Title>
                  <Paragraph style={{ margin: '4px 0 0', fontSize: isMobile ? 13 : 14, color: isDark ? '#8c8c8c' : '#6b7280' }}>
                    {val.desc}
                  </Paragraph>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
