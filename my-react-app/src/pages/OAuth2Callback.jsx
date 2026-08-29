import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Spin, Typography, Grid } from "antd"
import { setAccessToken, setRefreshToken } from "../api/tokenStorage"
import userService from "../api/userService"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"

const { Title } = Typography
const { useBreakpoint } = Grid

export default function OAuth2Callback() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const { isDark } = useTheme()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get("accessToken")
    const refreshToken = params.get("refreshToken")

    if (!accessToken) {
      navigate("/login?error=oauth2_failed", { replace: true })
      return
    }

    const completeLogin = async () => {
      try {
        setAccessToken(accessToken)
        if (refreshToken) setRefreshToken(refreshToken)

        const profileRes = await userService.getProfile()
        const userData = profileRes.data.data
        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)

        navigate("/dashboard", { replace: true })
      } catch {
        navigate("/login?error=oauth2_failed", { replace: true })
      }
    }
    completeLogin()
  }, [navigate, setUser])

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
      gap: 24,
    }}>
      <Spin size="large" />
      <Title level={isMobile ? 4 : 3} style={{ color: isDark ? "#e8e8e8" : "#1a1a2e", margin: 0 }}>
        Đang đăng nhập...
      </Title>
    </div>
  )
}
