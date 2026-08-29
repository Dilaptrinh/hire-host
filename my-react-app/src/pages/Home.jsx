import { Button, Card, Col, Row, Typography, Grid } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  CloudServerOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CustomerServiceOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useTheme } from '../contexts/ThemeContext'

const { Title, Paragraph, Text } = Typography
const { useBreakpoint } = Grid

const features = [
  { icon: <ThunderboltOutlined />, title: 'Tốc độ cao', desc: 'SSD NVMe, băng thông 1Gbps' },
  { icon: <SafetyOutlined />, title: 'Bảo mật', desc: 'SSL miễn phí, DDoS Protection' },
  { icon: <CustomerServiceOutlined />, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ kỹ thuật chuyên nghiệp' },
  { icon: <CloudServerOutlined />, title: 'Uptime 99.9%', desc: 'Cam kết hoạt động liên tục' },
]

const stats = [
  { value: 15000, suffix: '+', label: 'Khách hàng' },
  { value: 99.9, suffix: '%', label: 'Uptime' },
  { value: 50, suffix: 'ms', label: 'Tốc độ' },
  { value: 24, suffix: '/7', label: 'Hỗ trợ' },
]

export default function Home() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  return (
    <div>
      <div style={{ textAlign: 'center', padding: isMobile ? '32px 0 24px' : '60px 0 40px' }}>
        <Title style={{
          fontSize: isMobile ? 28 : 42,
          marginBottom: 16,
          color: isDark ? '#e8e8e8' : '#1a1a2e',
        }}>
          Thuê Hosting Giá Rẻ
        </Title>
        <Paragraph style={{
          fontSize: isMobile ? 15 : 18,
          color: isDark ? '#8c8c8c' : '#6b7280',
          maxWidth: 600,
          margin: '0 auto 24px',
          padding: '0 16px',
        }}>
          Tốc độ cao - Bảo mật tối ưu - Hỗ trợ 24/7. Khởi tạo website của bạn ngay hôm nay!
        </Paragraph>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', padding: '0 16px' }}>
          <Button type="primary" size={isMobile ? 'middle' : 'large'} onClick={() => navigate('/hosting')}>
            Xem gói hosting <ArrowRightOutlined />
          </Button>
          <Button size={isMobile ? 'middle' : 'large'} onClick={() => navigate('/about')}>
            Tìm hiểu thêm
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ margin: isMobile ? '16px 0' : '40px 0' }}>
        {features.map((feat, i) => (
          <Col xs={24} md={8} lg={6} key={i}>
            <Card
              hoverable
              styles={{ body: { padding: isMobile ? 20 : 24 } }}
              style={{
                textAlign: 'center',
                borderRadius: 12,
                background: isDark ? '#1f1f1f' : '#fff',
                border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
              }}
            >
              <div style={{ fontSize: isMobile ? 28 : 36, color: '#1677ff', marginBottom: 12 }}>{feat.icon}</div>
              <Title level={4} style={{ fontSize: isMobile ? 16 : 20, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
                {feat.title}
              </Title>
              <Text style={{ fontSize: isMobile ? 13 : 14, color: isDark ? '#8c8c8c' : '#6b7280' }}>{feat.desc}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{
        padding: isMobile ? '24px 16px' : '40px 24px',
        borderRadius: 16,
        background: isDark ? '#1f1f1f' : '#f0f5ff',
        margin: isMobile ? '16px 0' : '40px 0',
      }}>
        <Row gutter={[16, 24]} justify="center">
          {stats.map((stat, i) => (
            <Col xs={12} sm={6} key={i}>
              <div style={{ textAlign: 'center' }}>
                <Title level={isMobile ? 3 : 2} style={{ color: '#1677ff', margin: 0, fontSize: isMobile ? 22 : 32 }}>
                  {stat.value}{stat.suffix}
                </Title>
                <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: isMobile ? 13 : 16 }}>
                  {stat.label}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}
