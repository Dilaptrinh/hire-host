import { useEffect, useState } from 'react'
import { Table, Tag, Typography, Grid, Spin, message, Button, Space, Select, Modal } from 'antd'
import { LockOutlined, UnlockOutlined, DeleteOutlined, CrownOutlined } from '@ant-design/icons'
import adminService from '../../api/adminService'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

const { Title } = Typography
const { useBreakpoint } = Grid

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const { isDark } = useTheme()
  const { user: currentUser, isSuperAdmin } = useAuth()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await adminService.getAllUsers({ page, size: 10, sort: ['id,desc'] })
        setUsers(res.data.data.content || [])
        setTotal(res.data.data.totalElements || 0)
      } catch {
        message.error('Không thể tải danh sách người dùng')
      } finally {
        setLoading(false)
      }
    })()
  }, [page])

  const handleStatus = async (id, status) => {
    try {
      await adminService.changeUserStatus(id, status)
      message.success(status === 'ACTIVE' ? 'Đã kích hoạt người dùng' : 'Đã khóa người dùng')
      const res = await adminService.getAllUsers({ page, size: 10, sort: ['id,desc'] })
      setUsers(res.data.data.content || [])
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại')
    }
  }

  const handleRole = async (id, role) => {
    try {
      await adminService.changeUserRole(id, role)
      message.success('Đã thay đổi vai trò')
      const res = await adminService.getAllUsers({ page, size: 10, sort: ['id,desc'] })
      setUsers(res.data.data.content || [])
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
          const res = await adminService.getAllUsers({ page, size: 10, sort: ['id,desc'] })
          setUsers(res.data.data.content || [])
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
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        scroll={{ x: isMobile ? 700 : undefined }}
        size={isMobile ? 'small' : 'middle'}
        pagination={{ current: page + 1, total, pageSize: 10, onChange: (p) => setPage(p - 1) }}
      />
    </div>
  )
}
