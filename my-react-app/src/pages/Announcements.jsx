import { useEffect, useState } from 'react'
import { Card, Typography, Space, Grid, Spin, Empty, message, Tag } from 'antd'
import { NotificationOutlined, CalendarOutlined } from '@ant-design/icons'
import { useTheme } from '../contexts/ThemeContext'
import announcementService from '../api/announcementService'

const { Title, Text, Paragraph } = Typography
const { useBreakpoint } = Grid

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export default function Announcements() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  useEffect(() => {
    (async () => {
      try {
        const res = await announcementService.getAll()
        setList(res.data.data || [])
      } catch {
        message.error('Không thể tải thông báo')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: isMobile ? '16px 0 20px' : '28px 0 32px' }}>
        <Title level={isMobile ? 3 : 2} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
          <NotificationOutlined /> Thông báo
        </Title>
        <Paragraph style={{ color: isDark ? '#8c8c8c' : '#6b7280' }}>
          Cập nhật tin tức và thông báo mới nhất từ hệ thống.
        </Paragraph>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : list.length === 0 ? (
        <Empty description="Chưa có thông báo nào" style={{ padding: 60 }} />
      ) : (
        <Space direction="vertical" size={isMobile ? 12 : 16} style={{ width: '100%' }}>
          {list.map((item) => (
            <Card
              key={item.id}
              style={{
                borderRadius: 12,
                background: isDark ? '#1f1f1f' : '#fff',
                border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
              }}
              styles={{ body: { padding: isMobile ? 16 : 24 } }}
            >
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Space wrap>
                  <Tag icon={<CalendarOutlined />} color="blue">{formatDate(item.createdAt)}</Tag>
                </Space>
                <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
                  {item.title}
                </Title>
                <Paragraph
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    color: isDark ? '#d0d0d0' : '#374151',
                  }}
                >
                  {item.content}
                </Paragraph>
              </Space>
            </Card>
          ))}
        </Space>
      )}
    </div>
  )
}
