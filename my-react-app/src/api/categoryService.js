import axiosClient from './axiosClient'

const categoryService = {
  getAll() {
    return axiosClient.get('/api/v1/categories')
  },

  getById(id) {
    return axiosClient.get(`/api/v1/categories/${id}`)
  },

  getServersByCategory(id) {
    return axiosClient.get(`/api/v1/categories/${id}/servers`)
  },
}

export default categoryService
