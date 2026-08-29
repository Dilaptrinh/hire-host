import { useEffect, useState } from 'react'
import { Table, Typography, Grid, Spin, message, Button, Space, Modal, Form, Input, InputNumber, Select } from 'antd'
import { CloudServerOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import adminService from '../../api/adminService'
import categoryService from '../../api/categoryService'
import { useTheme } from '../../contexts/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

export default function AdminServers() {
  const [servers, setServers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const [sRes, cRes] = await Promise.all([
          adminService.getAllServers({ page, size: 10, sort: ['id,desc'] }),
          categoryService.getAll(),
        ])
        setServers(sRes.data.data.content || [])
        setTotal(sRes.data.data.totalElements || 0)
        setCategories(cRes.data.data || [])
      } catch {
        message.error('Không thể tải dữ liệu')
      } finally {
        setLoading(false)
      }
    })()
  }, [page])

  const refreshServers = async () => {
    const res = await adminService.getAllServers({ page, size: 10, sort: ['id,desc'] })
    setServers(res.data.data.content || [])
    setTotal(res.data.data.totalElements || 0)
  }

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (server) => {
    setEditing(server)
    form.setFieldsValue(server)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      if (editing) {
        await adminService.updateServer(editing.id, values)
        message.success('Đã cập nhật gói hosting')
      } else {
        await adminService.createServer(values)
        message.success('Đã tạo gói hosting mới')
      }
      setModalOpen(false)
      await refreshServers()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.response?.data?.message || 'Lưu thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa gói hosting',
      content: 'Bạn có chắc chắn muốn xóa?',
      okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminService.deleteServer(id)
          message.success('Đã xóa')
          await refreshServers()
        } catch (err) {
          message.error(err.response?.data?.message || 'Xóa thất bại')
        }
      },
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'CPU', dataIndex: 'cpu', key: 'cpu', responsive: ['md'] },
    { title: 'RAM', dataIndex: 'ram', key: 'ram', responsive: ['md'] },
    { title: 'Storage', dataIndex: 'storage', key: 'storage', responsive: ['md'] },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: (p) => <Text strong>{formatPrice(p)}₫</Text> },
    { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName', render: (v) => v || '--', responsive: ['lg'] },
    {
      title: '', key: 'actions', render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ]

  if (loading && servers.length === 0) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={isMobile ? 4 : 3} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', margin: 0 }}>
          <CloudServerOutlined /> Quản lý gói hosting
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm gói</Button>
      </div>

      <Table
        columns={columns}
        dataSource={servers}
        rowKey="id"
        loading={loading}
        scroll={{ x: isMobile ? 700 : undefined }}
        size={isMobile ? 'small' : 'middle'}
        pagination={{ current: page + 1, total, pageSize: 10, onChange: (p) => setPage(p - 1) }}
      />

      <Modal
        title={editing ? 'Sửa gói hosting' : 'Thêm gói hosting mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="Tên gói" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="categoryId" label="Danh mục">
            <Select allowClear placeholder="Chọn danh mục" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="cpu" label="CPU" rules={[{ required: true, message: 'Vui lòng nhập CPU' }]}>
            <Input placeholder="VD: 2 cores" />
          </Form.Item>
          <Form.Item name="ram" label="RAM" rules={[{ required: true, message: 'Vui lòng nhập RAM' }]}>
            <Input placeholder="VD: 4 GB" />
          </Form.Item>
          <Form.Item name="storage" label="Storage" rules={[{ required: true, message: 'Vui lòng nhập Storage' }]}>
            <Input placeholder="VD: 50 GB SSD" />
          </Form.Item>
          <Form.Item name="bandwidth" label="Bandwidth" rules={[{ required: true, message: 'Vui lòng nhập Bandwidth' }]}>
            <Input placeholder="VD: 500 GB" />
          </Form.Item>
          <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
            <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 199000" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
