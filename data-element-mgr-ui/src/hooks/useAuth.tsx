import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import request from '../utils/request'

interface UserProfile {
  id: string
  username: string
  displayName: string
  email: string
}

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    request.get('/auth/profile', { params: { access_token: token } })
      .then((res: unknown) => {
        const data = res as { code: number; data: UserProfile }
        if (data.code === 200 && data.data) {
          setUser(data.data)
        }
      })
      .catch(() => {
        Cookies.remove('access_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const logout = () => {
    Cookies.remove('access_token')
    window.location.href = '/login'
  }

  return { user, loading, logout }
}
