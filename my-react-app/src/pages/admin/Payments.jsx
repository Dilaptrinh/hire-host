import { useEffect, useState } from 'react'
import { Table, Tag, Typography, Grid, Spin, message } from 'antd'
import { DollarOutlined } from '@ant-design/icons'
import adminService from '../../api/adminService'
import { useTheme } from '../../contexts/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const methodLabels = { BANKING: 'Chuyển khoản', MOMO: 'MoMo', VNPAY: 'VNPay', CASH: 'Tiền mặt' }

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p)

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      try {
        const res = await adminService.getAllPayments({ page, size: 10, sort: ['id,desc'] })
        setPayments(res.data.data.content || [])
        setTotal(res.data.data.totalElements || 0)
      } catch { message.error('Không thể tải thanh toán')
      } finally { setLoading(false) }
    }
    fetchPayments()
  }, [page])

  const statusColors = { PENDING: 'gold', COMPLETED: 'green', FAILED: 'red', REFUNDED: 'blue' }
  const statusLabels = { PENDING: 'Chờ xử lý', COMPLETED: 'Hoàn tất', FAILED: 'Thất bại', REFUNDED: 'Hoàn tiền' }

  const columns = [
    { title: 'Mã GD', dataIndex: 'id', key: 'id', width: 80, render: (id) => <Text copyable>#{id}</Text> },
    { title: 'Mã ĐH', dataIndex: 'orderId', key: 'orderId', render: (oid) => `#${oid}` },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (a) => <Text strong>{formatPrice(a)}₫</Text> },
    { title: 'Phương thức', dataIndex: 'method', key: 'method', render: (m) => methodLabels[m] || m, responsive: ['md'] },
    { title: 'Mã GD', dataIndex: 'transactionId', key: 'transactionId', render: (v) => v || '--', responsive: ['lg'] },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s] || 'default'}>{statusLabels[s] || s}</Tag> },
    { title: 'Ngày', dataIndex: 'paidAt', key: 'paidAt', render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '--', responsive: ['md'] },
  ]

  if (loading && payments.length === 0) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <Title level={isMobile ? 4 : 3} style={{ color: isDark ? '#e8e8e8' : '#1a1a2e', marginBottom: 16 }}>
        <DollarOutlined /> Quản lý thanh toán
      </Title>
      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={loading}
        scroll={{ x: isMobile ? 700 : undefined }}
        size={isMobile ? 'small' : 'middle'}
        pagination={{ current: page + 1, total, pageSize: 10, onChange: (p) => setPage(p - 1) }}
      />
    </div>
  )
}
