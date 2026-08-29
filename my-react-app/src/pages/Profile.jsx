import { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Tag, Space, Grid, Descriptions, Spin, Empty, message, Button, Modal, Form, Input } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  CloudServerOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  LockOutlined,
  EditOutlined,
} from '@ant-design/icons'
import userService from '../api/userService'
import orderService from '../api/orderService'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const statusColors = {
  PENDING: 'gold',
  ACTIVE: 'green',
  CANCELLED: 'red',
  EXPIRED: 'default',
}

const statusLabels = {
  PENDING: 'Chờ thanh toán',
  ACTIVE: 'Hoạt động',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
}

export default function Profile() {
  const { setUser } = useAuth()
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit profile modal
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm] = Form.useForm()

  // Change password modal
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordForm] = Form.useForm()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          userService.getProfile(),
          orderService.getAllMine({ page: 0, size: 10, sort: ['createdAt,desc'] }),
        ])
        setProfile(profileRes.data.data)
        setOrders(ordersRes.data.data.content || [])
      } catch {
        message.error('Không thể tải thông tin')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const handleEditProfile = async () => {
    try {
      const values = await editForm.validateFields()
      setEditLoading(true)
      const res = await userService.updateProfile(values)
      const updated = res.data.data
      setProfile(updated)
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      message.success('Cập nhật thông tin thành công')
      setEditOpen(false)
    } catch (error) {
      if (error.errorFields) return
      message.error(error.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setEditLoading(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      setPasswordLoading(true)
      await userService.changePassword(values)
      message.success('Đổi mật khẩu thành công')
      setPasswordOpen(false)
      passwordForm.resetFields()
    } catch (error) {
      if (error.errorFields) return
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Title level={isMobile ? 4 : 3} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', marginBottom: 24 }}>
        Thông tin tài khoản
      </Title>

      <Card
        style={{
          borderRadius: 12,
          marginBottom: 24,
          background: isDark ? '#1f1f1f' : '#fff',
          border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
        }}
        styles={{ body: { padding: isMobile ? 20 : 32 } }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 16 : 24,
          marginBottom: 24,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 16 : 24 }}>
            <div style={{
              width: isMobile ? 56 : 72,
              height: isMobile ? 56 : 72,
              borderRadius: '50%',
              background: '#1677ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <UserOutlined style={{ fontSize: isMobile ? 24 : 32, color: '#fff' }} />
            </div>
            <div>
              <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: isDark ? '#e8e8e8' : '#1a1a2e' }}>
                {profile?.fullName || 'User'}
              </Title>
              <Space style={{ marginTop: 4 }}>
                <MailOutlined style={{ color: '#8c8c8c' }} />
                <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280' }}>{profile?.email}</Text>
              </Space>
            </div>
          </div>
          <Space>
            <Button icon={<EditOutlined />} onClick={() => { editForm.setFieldsValue(profile); setEditOpen(true) }}>
              Sửa thông tin
            </Button>
            <Button icon={<LockOutlined />} onClick={() => setPasswordOpen(true)}>
              Đổi mật khẩu
            </Button>
          </Space>
        </div>

        <Descriptions
          column={isMobile ? 1 : 2}
          size={isMobile ? 'small' : 'default'}
          styles={{
            label: { color: isDark ? '#8c8c8c' : '#6b7280' },
            content: { color: isDark ? '#e8e8e8' : '#1a1a2e' },
          }}
        >
          <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>{profile?.fullName || '--'}</Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> Email</>}>{profile?.email || '--'}</Descriptions.Item>
          <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>{profile?.phone || '--'}</Descriptions.Item>
          <Descriptions.Item label={<><CheckCircleOutlined /> Trạng thái</>}>
            <Tag color={profile?.status === 'ACTIVE' ? 'green' : 'red'}>
              {profile?.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            <Tag color={profile?.role === 'SUPER_ADMIN' ? 'red' : profile?.role === 'ADMIN' ? 'blue' : 'default'}>
              {profile?.role === 'SUPER_ADMIN' ? 'Super Admin' : profile?.role === 'ADMIN' ? 'Admin' : 'Người dùng'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={<><CloudServerOutlined /> Đơn hàng</>}>{orders.length}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Title level={isMobile ? 5 : 4} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', marginBottom: 16 }}>
        Lịch sử đơn hàng
      </Title>

      {orders.length === 0 ? (
        <Empty description="Chưa có đơn hàng nào" />
      ) : (
        orders.map((order) => (
          <Card
            key={order.id}
            style={{
              borderRadius: 12,
              marginBottom: 12,
              background: isDark ? '#1f1f1f' : '#fff',
              border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
            }}
            styles={{ body: { padding: isMobile ? 16 : 20 } }}
          >
            <Row gutter={[16, 12]} align="middle">
              <Col xs={24} sm={4}>
                <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: 12 }}>MÃ ĐƠN</Text>
                <div>
                  <Text copyable strong style={{ color: '#1677ff', fontSize: 13 }}>
                    #{order.id}
                  </Text>
                </div>
              </Col>
              <Col xs={12} sm={5}>
                <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: 12 }}>GÓI</Text>
                <div>
                  <Text strong style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', fontSize: isMobile ? 13 : 14 }}>
                    <CloudServerOutlined style={{ marginRight: 6, color: '#1677ff' }} />
                    {order.serverName}
                  </Text>
                </div>
              </Col>
              <Col xs={12} sm={4}>
                <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: 12 }}>BẮT ĐẦU</Text>
                <div><Text style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', fontSize: isMobile ? 13 : 14 }}>{order.startDate}</Text></div>
              </Col>
              <Col xs={12} sm={4}>
                <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: 12 }}>KẾT THÚC</Text>
                <div><Text style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', fontSize: isMobile ? 13 : 14 }}>{order.endDate}</Text></div>
              </Col>
              <Col xs={12} sm={4}>
                <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: 12 }}>GIÁ</Text>
                <div><Text strong style={{ color: '#1677ff', fontSize: isMobile ? 13 : 14 }}>{formatPrice(order.totalPrice)}₫</Text></div>
              </Col>
              <Col xs={12} sm={3}>
                <Text style={{ color: isDark ? '#8c8c8c' : '#6b7280', fontSize: 12 }}>TRẠNG THÁI</Text>
                <div>
                  <Tag color={statusColors[order.status] || 'default'} style={{ margin: 0 }}>
                    {statusLabels[order.status] || order.status}
                  </Tag>
                </div>
              </Col>
            </Row>
          </Card>
        ))
      )}

      {/* Edit Profile Modal */}
      <Modal
        title="Sửa thông tin"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleEditProfile}
        confirmLoading={editLoading}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical" requiredMark={false}>
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Họ tên" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Số điện thoại" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="Đổi mật khẩu"
        open={passwordOpen}
        onCancel={() => { setPasswordOpen(false); passwordForm.resetFields() }}
        onOk={handleChangePassword}
        confirmLoading={passwordLoading}
        okText="Đổi mật khẩu"
        cancelText="Hủy"
      >
        <Form form={passwordForm} layout="vertical" requiredMark={false}>
          <Form.Item
            name="oldPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password placeholder="Mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
