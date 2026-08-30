import { useEffect, useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, Typography, Grid, message, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, NotificationOutlined, CalendarOutlined } from '@ant-design/icons'
import announcementService from '../../api/announcementService'
import { useTheme } from '../../contexts/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid
const { TextArea } = Input

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('vi-VN')
}

export default function AdminAnnouncements() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const load = async (p = page) => {
    setLoading(true)
    try {
      const res = await announcementService.getAllAdmin({ page: p, size: 10, sort: 'createdAt,desc' })
      setList(res.data.data.content || [])
      setTotal(res.data.data.totalElements || 0)
    } catch {
      message.error('Không thể tải thông báo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({ title: record.title, content: record.content })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        await announcementService.update(editing.id, values)
        message.success('Đã cập nhật thông báo')
      } else {
        await announcementService.create(values)
        message.success('Đã tạo thông báo')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xóa thông báo',
      content: `Xóa "${record.title}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await announcementService.delete(record.id)
          message.success('Đã xóa thông báo')
          load()
        } catch (err) {
          message.error(err.response?.data?.message || 'Xóa thất bại')
        }
      },
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Tiêu đề', dataIndex: 'title', render: (v) => <Text strong>{v}</Text> },
    { title: 'Nội dung', dataIndex: 'content', ellipsis: true, render: (v) => v || '--' },
    {
      title: 'Ngày tạo', dataIndex: 'createdAt',
      render: (v) => <Tag icon={<CalendarOutlined />} color="blue">{formatDate(v)}</Tag>,
    },
    {
      title: '', key: 'actions', width: 110,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={isMobile ? 4 : 3} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', margin: 0 }}>
          <NotificationOutlined /> Quản lý thông báo
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tạo thông báo</Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        scroll={{ x: isMobile ? 640 : undefined }}
        size={isMobile ? 'small' : 'middle'}
        pagination={{ current: page + 1, total, pageSize: 10, onChange: (p) => setPage(p - 1) }}
      />

      <Modal
        title={editing ? 'Sửa thông báo' : 'Tạo thông báo'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText={editing ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input maxLength={255} placeholder="Tiêu đề thông báo" />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
            <TextArea rows={6} maxLength={10000} placeholder="Nội dung thông báo..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
