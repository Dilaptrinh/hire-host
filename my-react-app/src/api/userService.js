import axiosClient from './axiosClient'

const userService = {
  getProfile() {
    return axiosClient.get('/api/v1/users/me')
  },

  updateProfile(data) {
    return axiosClient.put('/api/v1/users/me', data)
  },

  changePassword(data) {
    return axiosClient.put('/api/v1/users/me/password', data)
  },
}

export default userService
