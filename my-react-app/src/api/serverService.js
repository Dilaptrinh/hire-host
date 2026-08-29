import axiosClient from './axiosClient'

const serverService = {
  getAll(pageable) {
    return axiosClient.get('/api/v1/servers', { params: pageable })
  },

  getById(id) {
    return axiosClient.get(`/api/v1/servers/${id}`)
  },
}

export default serverService
