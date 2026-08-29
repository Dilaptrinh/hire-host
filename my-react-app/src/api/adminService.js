import axiosClient from './axiosClient'

const adminService = {
  // Users
  getAllUsers(pageable) {
    return axiosClient.get('/api/v1/admin/users', { params: pageable })
  },

  getUserById(id) {
    return axiosClient.get(`/api/v1/admin/users/${id}`)
  },

  deleteUser(id) {
    return axiosClient.delete(`/api/v1/admin/users/${id}`)
  },

  changeUserStatus(id, status) {
    return axiosClient.put(`/api/v1/admin/users/${id}/status`, null, { params: { status } })
  },

  changeUserRole(id, role) {
    return axiosClient.put(`/api/v1/admin/users/${id}/role`, null, { params: { role } })
  },

  // Servers
  getAllServers(pageable) {
    return axiosClient.get('/api/v1/admin/servers', { params: pageable })
  },

  createServer(data) {
    return axiosClient.post('/api/v1/admin/servers', data)
  },

  updateServer(id, data) {
    return axiosClient.put(`/api/v1/admin/servers/${id}`, data)
  },

  deleteServer(id) {
    return axiosClient.delete(`/api/v1/admin/servers/${id}`)
  },

  // Categories
  createCategory(data) {
    return axiosClient.post('/api/v1/admin/categories', data)
  },

  updateCategory(id, data) {
    return axiosClient.put(`/api/v1/admin/categories/${id}`, data)
  },

  deleteCategory(id) {
    return axiosClient.delete(`/api/v1/admin/categories/${id}`)
  },

  // Orders
  getAllOrders(pageable) {
    return axiosClient.get('/api/v1/admin/orders', { params: pageable })
  },

  getOrderById(id) {
    return axiosClient.get(`/api/v1/admin/orders/${id}`)
  },

  // Payments
  getAllPayments(pageable) {
    return axiosClient.get('/api/v1/admin/payments', { params: pageable })
  },
}

export default adminService
