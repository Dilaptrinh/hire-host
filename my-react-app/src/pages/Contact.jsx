import { useState } from 'react'
import { Card, Row, Col, Form, Input, Button, Typography, message, Space, Grid } from 'antd'
import {
  MailOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { useTheme } from '../contexts/ThemeContext'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { useBreakpoint } = Grid

const contactInfo = [
  { icon: <EnvironmentOutlined />, label: 'Địa chỉ', value: '123 Nguyễn Huệ, Q.1, TP.HCM' },
  { icon: <MailOutlined />, label: 'Email', value: 'support@hirehost.vn' },
  { icon: <PhoneOutlined />, label: 'Hotline', value: '1900 1234 5678' },
  { icon: <ClockCircleOutlined />, label: 'Giờ làm việc', value: 'Thứ 2 - Thứ 7, 8:00 - 18:00' },
]

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const onFinish = () => {
    setLoading(true)
    setTimeout(() => {
      message.success('Cảm ơn bạn! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.')
      setLoading(false)
    }, 1000)
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: isMobile ? '20px 0' : '32px 0' }}>
        <Title level={isMobile ? 3 : 2} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
          Liên hệ
        </Title>
        <Paragraph style={{
          fontSize: isMobile ? 14 : 16,
          color: isDark ? '#8c8c8c' : '#6b7280',
          maxWidth: 500,
          margin: '0 auto',
        }}>
          Bạn có thắc mắc hoặc cần hỗ trợ? Hãy gửi tin nhắn cho chúng tôi.
        </Paragraph>
      </div>

      <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]}>
        <Col xs={24} lg={14}>
          <Card
            style={{
              borderRadius: 12,
              background: isDark ? '#1f1f1f' : '#fff',
              border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
            }}
            styles={{ body: { padding: isMobile ? 20 : 32 } }}
          >
            <Title level={isMobile ? 5 : 4} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', marginBottom: 20 }}>
              Gửi tin nhắn
            </Title>
            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Họ tên" size={isMobile ? 'middle' : 'large'} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email" size={isMobile ? 'middle' : 'large'} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="message"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
              >
                <TextArea
                  rows={5}
                  placeholder="Nội dung tin nhắn..."
                  size={isMobile ? 'middle' : 'large'}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SendOutlined />} size="large" loading={loading}>
                  Gửi tin nhắn
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Space direction="vertical" size={isMobile ? 12 : 16} style={{ width: '100%' }}>
            {contactInfo.map((info, i) => (
              <Card
                key={i}
                size="small"
                style={{
                  borderRadius: 12,
                  background: isDark ? '#1f1f1f' : '#fff',
                  border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
                }}
                styles={{ body: { padding: isMobile ? 14 : 20 } }}
              >
                <Space size={12}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: isDark ? '#1677ff1a' : '#f0f5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    color: '#1677ff',
                    flexShrink: 0,
                  }}>
                    {info.icon}
                  </div>
                  <div>
                    <Text style={{ fontSize: 12, color: isDark ? '#8c8c8c' : '#6b7280', display: 'block' }}>
                      {info.label}
                    </Text>
                    <Text strong style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', fontSize: isMobile ? 13 : 14 }}>
                      {info.value}
                    </Text>
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        </Col>
      </Row>
    </div>
  )
}
