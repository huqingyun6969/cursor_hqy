import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { login } from '../../api/auth'

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const res: any = await login(values)
      if (res.code === 200 && res.data?.accessToken) {
        Cookies.set('access_token', res.data.accessToken, { expires: 1 })
        message.success('登录成功')
        navigate('/', { replace: true })
      } else {
        message.error(res.message || '登录失败')
      }
    } catch {
      message.error('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0b1e4d 0%, #1a4fa0 40%, #3b82f6 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
        top: '-200px',
        right: '-100px',
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
        bottom: '-100px',
        left: '-50px',
      }} />

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '48px 40px',
        width: '420px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1677ff, #4096ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(22, 119, 255, 0.3)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 600,
            color: '#1a1a1a',
            margin: '0 0 4px',
            letterSpacing: '1px',
          }}>湖南数据要素平台系统</h1>
          <p style={{
            fontSize: '14px',
            color: '#999',
            margin: 0,
          }}>Hunan Data Element Platform</p>
        </div>

        <Form onFinish={onFinish} size="large" autoComplete="off">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: '8px' }}>
            <Button type="primary" htmlType="submit" loading={loading} block style={{
              height: '44px',
              fontSize: '16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1677ff, #4096ff)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(22, 119, 255, 0.4)',
            }}>
              登 录
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '13px',
        zIndex: 1,
      }}>
        © 2025 湖南数据要素平台 版权所有
      </div>
    </div>
  )
}

export default LoginPage
