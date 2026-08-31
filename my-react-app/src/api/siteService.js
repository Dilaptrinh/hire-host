import axiosClient from './axiosClient'

const siteService = {
  // Upload folder (multipart), preserving directory structure via webkitRelativePath
  deployFolder(files, subdomain) {
    const formData = new FormData()
    files.forEach((f) => {
      // Bỏ thư mục gốc (folder được chọn) để index.html về root của site
      const raw = f.webkitRelativePath || f.name || ''
      const parts = raw.replace(/\\/g, '/').split('/').filter(Boolean)
      const relPath = f.webkitRelativePath && parts.length > 1 ? parts.slice(1).join('/') : parts.join('/')
      formData.append('files', f, relPath || f.name)
    })
    if (subdomain && subdomain.trim()) {
      formData.append('subdomain', subdomain.trim())
    }
    return axiosClient.post('/api/v1/sites/deploy/folder', formData, {
      headers: { 'Content-Type': undefined },
    })
  },
  deployGithub(githubUrl, subdomain) {
    return axiosClient.post('/api/v1/sites/deploy/github', { source: 'GITHUB', githubUrl, subdomain })
  },
  getMySite() {
    return axiosClient.get('/api/v1/sites/me')
  },
}

export default siteService
