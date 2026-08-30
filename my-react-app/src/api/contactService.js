import axiosClient from './axiosClient'

const contactService = {
  sendContact(data) {
    return axiosClient.post('/api/v1/contact', data)
  },
}

export default contactService
