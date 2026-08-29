import axiosClient from './axiosClient'

const orderService = {
  getAllMine(pageable) {
    return axiosClient.get('/api/v1/orders', { params: pageable })
  },

  create(data) {
    return axiosClient.post('/api/v1/orders', data)
  },

  getById(id) {
    return axiosClient.get(`/api/v1/orders/${id}`)
  },

  cancel(id) {
    return axiosClient.put(`/api/v1/orders/${id}/cancel`)
  },
}

export default orderService
