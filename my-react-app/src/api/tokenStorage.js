let accessToken = null

export const setAccessToken = (token) => { accessToken = token }
export const getAccessToken = () => accessToken
export const clearAccessToken = () => { accessToken = null }

// Refresh token được server đặt qua cookie HttpOnly (Secure), không thể đọc/set từ JS.
export const setRefreshToken = (token) => { /* server sets HttpOnly cookie */ }
export const getRefreshToken = () => null
export const clearRefreshToken = () => { /* server clears HttpOnly cookie on logout */ }
