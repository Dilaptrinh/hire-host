import axiosClient from './axiosClient'

const contactService = {
  sendContact(data) {
    return axiosClient.post('/api/v1/contact', data, { _skipAuth: true })
  },
}

export default contactService
