import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { Spin } from 'antd'
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
      .then((res: any) => {
        if (res.code === 200 && res.data) {
          setUser(res.data)
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

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  const token = Cookies.get('access_token')

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [token, navigate])

  if (!token) {
    return <Spin spinning tip="正在跳转登录..." fullscreen />
  }

  return <>{children}</>
}
