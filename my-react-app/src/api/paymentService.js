import axiosClient from './axiosClient'

const paymentService = {
  getAllMine() {
    return axiosClient.get('/api/v1/payments')
  },

  create(data) {
    return axiosClient.post('/api/v1/payments', data)
  },
}

export default paymentService
