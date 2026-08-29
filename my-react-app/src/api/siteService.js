import axiosClient from './axiosClient'

const siteService = {
  // Upload folder (multipart), preserving directory structure via webkitRelativePath
  deployFolder(files) {
    const formData = new FormData()
    files.forEach((f) => {
      const relPath = f.webkitRelativePath || f.name
      formData.append('files', f, relPath)
    })
    return axiosClient.post('/api/v1/sites/deploy/folder', formData, {
      headers: { 'Content-Type': undefined },
    })
  },
  deployGithub(githubUrl) {
    return axiosClient.post('/api/v1/sites/deploy/github', { source: 'GITHUB', githubUrl })
  },
  getMySite() {
    return axiosClient.get('/api/v1/sites/me')
  },
}

export default siteService
