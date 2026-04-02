import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { Spin } from 'antd'

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

export default AuthGuard
