import axiosClient from './axiosClient'

const authService = {
  register(data) {
    return axiosClient.post('/api/v1/auth/register', data)
  },

  login(data) {
    return axiosClient.post('/api/v1/auth/login', data)
  },

  refresh(data) {
    return axiosClient.post('/api/v1/auth/refresh', data)
  },

  logout() {
    return axiosClient.post('/api/v1/auth/logout')
  },
}

export default authService
