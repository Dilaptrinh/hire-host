import axiosClient from './axiosClient'

const serverService = {
  getAll(pageable) {
    return axiosClient.get('/api/v1/servers', { params: pageable, _skipAuth: true })
  },

  getById(id) {
    return axiosClient.get(`/api/v1/servers/${id}`, { _skipAuth: true })
  },
}

export default serverService
