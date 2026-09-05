import { useEffect, useState } from 'react'
import { Table, Tag, Typography, Grid, Spin, message, Button, Space, Select, Modal, Input, Drawer, Descriptions, Empty, Divider } from 'antd'
import { LockOutlined, UnlockOutlined, DeleteOutlined, CrownOutlined, SearchOutlined, LinkOutlined, ShoppingOutlined, GlobalOutlined } from '@ant-design/icons'
import adminService from '../../api/adminService'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [searchEmail, setSearchEmail] = useState('')
  const [roleFilter, setRoleFilter] = useState()
  const [statusFilter, setStatusFilter] = useState()
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [userOrders, setUserOrders] = useState([])
  const [userSites, setUserSites] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)
  const { isDark } = useTheme()
  const { user: currentUser, isSuperAdmin } = useAuth()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  useEffect(() => {
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        const res = await adminService.searchUsers({ page, size: 10, sort: 'id,desc', email: searchEmail, role: roleFilter, status: statusFilter })
        if (!active) return
        setUsers(res.data.data.content || [])
        setTotal(res.data.data.totalElements || 0)
      } catch {
        if (active) message.error('Không thể tải danh sách người dùng')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [page, searchEmail, roleFilter, statusFilter])

  const refresh = async () => {
    const res = await adminService.searchUsers({ page, size: 10, sort: 'id,desc', email: searchEmail, role: roleFilter, status: statusFilter })
    setUsers(res.data.data.content || [])
    setTotal(res.data.data.totalElements || 0)
  }

  const handleFilterChange = (setter) => (value) => {
    setter(value || undefined)
    setPage(0)
  }

  const openUserDetail = async (record) => {
    setSelectedUser(record)
    setDetailOpen(true)
    setDetailLoading(true)
    setUserOrders([])
    setUserSites([])
    try {
      const [o, s] = await Promise.all([
        adminService.getUserOrders(record.id, { page: 0, size: 20, sort: 'createdAt,desc' }),
        adminService.getUserSites(record.id),
      ])
      setUserOrders(o.data.data.content || [])
      setUserSites(s.data.data || [])
    } catch {
      message.error('Không thể tải chi tiết người dùng')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleStatus = async (id, status) => {
    try {
      await adminService.changeUserStatus(id, status)
      message.success(status === 'ACTIVE' ? 'Đã kích hoạt người dùng' : 'Đã khóa người dùng')
      await refresh()
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại')
    }
  }

  const handleRole = async (id, role) => {
    try {
      await adminService.changeUserRole(id, role)
      message.success('Đã thay đổi vai trò')
      await refresh()
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại')
    }
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa người dùng',
      content: 'Bạn có chắc chắn muốn xóa người dùng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminService.deleteUser(id)
          message.success('Đã xóa người dùng')
          await refresh()
        } catch (err) {
          message.error(err.response?.data?.message || 'Xóa thất bại')
        }
      },
    })
  }

  const handleDeleteSite = (site) => {
    Modal.confirm({
      title: 'Xóa website',
      content: `Xóa website "${site.subdomain}.bootnode.cloud" của người dùng này?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminService.deleteSite(site.id)
          message.success('Đã xóa website')
          setUserSites((prev) => prev.filter((s) => s.id !== site.id))
        } catch (err) {
          message.error(err.response?.data?.message || 'Xóa thất bại')
        }
      },
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', render: (v) => v || '--' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone', render: (v) => v || '--', responsive: ['md'] },
    {
      title: 'Vai trò', dataIndex: 'role', key: 'role',
      render: (role, record) => (
        <Select
          value={role}
          size="small"
          style={{ width: 130 }}
          disabled={!isSuperAdmin || record.id === currentUser?.id}
          onChange={(val) => handleRole(record.id, val)}
          options={[
            { value: 'USER', label: 'Người dùng' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'SUPER_ADMIN', label: 'Super Admin' },
          ]}
        />
      ),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}</Tag>
      ),
    },
    {
      title: '', key: 'actions',
      render: (_, record) => (
        <Space size={4}>
          {record.status === 'ACTIVE' ? (
            <Button size="small" icon={<LockOutlined />} danger onClick={() => handleStatus(record.id, 'BANNED')} />
          ) : (
            <Button size="small" icon={<UnlockOutlined />} onClick={() => handleStatus(record.id, 'ACTIVE')} />
          )}
          {isSuperAdmin && record.id !== currentUser?.id && (
            <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
          )}
        </Space>
      ),
    },
  ]

  if (loading && users.length === 0) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <Title level={isMobile ? 4 : 3} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', marginBottom: 16 }}>
        <CrownOutlined /> Quản lý người dùng
      </Title>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <Input.Search
          allowClear
          placeholder="Tìm theo email..."
          prefix={<SearchOutlined />}
          style={{ maxWidth: 360 }}
          onSearch={(value) => {
            setSearchEmail(value.trim())
            setPage(0)
          }}
        />
        <Select
          allowClear
          placeholder="Vai trò"
          style={{ width: 150 }}
          value={roleFilter}
          onChange={handleFilterChange(setRoleFilter)}
          options={[
            { value: 'USER', label: 'Người dùng' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'SUPER_ADMIN', label: 'Super Admin' },
          ]}
        />
        <Select
          allowClear
          placeholder="Trạng thái"
          style={{ width: 150 }}
          value={statusFilter}
          onChange={handleFilterChange(setStatusFilter)}
          options={[
            { value: 'ACTIVE', label: 'Hoạt động' },
            { value: 'BANNED', label: 'Bị khóa' },
          ]}
        />
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => openUserDetail(record),
          style: { cursor: 'pointer' },
        })}
        scroll={{ x: isMobile ? 700 : undefined }}
        size={isMobile ? 'small' : 'middle'}
        pagination={{ current: page + 1, total, pageSize: 10, onChange: (p) => setPage(p - 1) }}
      />
      <Drawer
        title={selectedUser ? `Chi tiết người dùng: ${selectedUser.email}` : ''}
        width={isMobile ? '100%' : 720}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        loading={detailLoading}
      >
        {selectedUser && (
          <>
            <Descriptions
              title={<Text strong><CrownOutlined /> Thông tin cá nhân</Text>}
              column={isMobile ? 1 : 2}
              size="small"
              bordered
            >
              <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="Họ tên">{selectedUser.fullName || '--'}</Descriptions.Item>
              <Descriptions.Item label="SĐT">{selectedUser.phone || '--'}</Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color={selectedUser.role === 'SUPER_ADMIN' ? 'gold' : selectedUser.role === 'ADMIN' ? 'blue' : 'default'}>
                  {selectedUser.role}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedUser.status === 'ACTIVE' ? 'green' : 'red'}>{selectedUser.status}</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0 8px' }} />
            <Text strong><ShoppingOutlined /> Lịch sử mua hàng</Text>
            {userOrders.length === 0 ? (
              <Empty description="Chưa có đơn hàng" style={{ margin: '16px 0' }} />
            ) : (
              <Table
                rowKey="id"
                size="small"
                style={{ marginTop: 8 }}
                dataSource={userOrders}
                pagination={false}
                scroll={{ x: 520 }}
                columns={[
                  { title: 'Mã đơn', dataIndex: 'id', width: 70 },
                  { title: 'Gói', dataIndex: 'serverName', render: (v) => v || '--' },
                  { title: 'Tổng tiền', dataIndex: 'totalPrice', render: (v) => `${Number(v || 0).toLocaleString('vi-VN')} đ` },
                  {
                    title: 'Trạng thái', dataIndex: 'status',
                    render: (v) => <Tag color={v === 'ACTIVE' ? 'green' : v === 'PENDING' ? 'orange' : 'default'}>{v}</Tag>,
                  },
                  { title: 'Ngày', dataIndex: 'startDate', render: (v) => v || '--' },
                ]}
              />
            )}

            <Divider style={{ margin: '16px 0 8px' }} />
            <Text strong><GlobalOutlined /> Website đã deploy</Text>
            {userSites.length === 0 ? (
              <Empty description="Chưa deploy website" style={{ margin: '16px 0' }} />
            ) : (
              <div style={{ marginTop: 8 }}>
                {userSites.map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Space>
                      <Text code>{s.subdomain}</Text>
                      <Tag color={s.status === 'ACTIVE' ? 'green' : s.status === 'FAILED' ? 'red' : 'orange'}>{s.status}</Tag>
                    </Space>
                    <Space>
                      {s.status === 'ACTIVE' && s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          <LinkOutlined /> {s.url}
                        </a>
                      ) : (
                        <Text type="secondary">{s.errorMessage || '--'}</Text>
                      )}
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteSite(s)} />
                    </Space>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
