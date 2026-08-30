import axiosClient from './axiosClient'

const announcementService = {
  getAll() {
    return axiosClient.get('/api/v1/announcements')
  },
  getAllAdmin(pageable) {
    return axiosClient.get('/api/v1/admin/announcements', { params: pageable })
  },
  create(data) {
    return axiosClient.post('/api/v1/admin/announcements', data)
  },
  update(id, data) {
    return axiosClient.put(`/api/v1/admin/announcements/${id}`, data)
  },
  delete(id) {
    return axiosClient.delete(`/api/v1/admin/announcements/${id}`)
  },
}

export default announcementService
