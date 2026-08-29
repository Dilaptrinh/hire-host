let accessToken = null

export const setAccessToken = (token) => { accessToken = token }
export const getAccessToken = () => accessToken
export const clearAccessToken = () => { accessToken = null }

const REFRESH_TOKEN_KEY = 'refreshToken'

export const setRefreshToken = (token) => {
  const maxAge = 30 * 24 * 60 * 60
  document.cookie = `${REFRESH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Strict`
}

export const getRefreshToken = () => {
  const cookies = document.cookie.split('; ')
  for (const cookie of cookies) {
    const idx = cookie.indexOf('=')
    if (idx === -1) continue
    const name = cookie.slice(0, idx).trim()
    if (name === REFRESH_TOKEN_KEY) {
      return decodeURIComponent(cookie.slice(idx + 1))
    }
  }
  return null
}

export const clearRefreshToken = () => {
  document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0`
}
