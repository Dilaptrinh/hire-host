import axiosClient from './axiosClient'

const categoryService = {
  getAll() {
    return axiosClient.get('/api/v1/categories', { _skipAuth: true })
  },

  getById(id) {
    return axiosClient.get(`/api/v1/categories/${id}`, { _skipAuth: true })
  },

  getServersByCategory(id) {
    return axiosClient.get(`/api/v1/categories/${id}/servers`, { _skipAuth: true })
  },
}

export default categoryService
