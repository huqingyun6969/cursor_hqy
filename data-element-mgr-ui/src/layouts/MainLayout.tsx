import React, { Suspense, useState, useMemo } from 'react'
import { Layout, Menu, Tabs, Dropdown, Avatar, Space, Spin } from 'antd'
import {
  HomeOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
  AuditOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Cookies from 'js-cookie'

const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage'))
const DocumentPage = React.lazy(() => import('../pages/standard/document/DocumentPage'))
const DataStandardPage = React.lazy(() => import('../pages/standard/dataStandard/DataStandardPage'))
const MappingPage = React.lazy(() => import('../pages/standard/mapping/MappingPage'))
const CompliancePage = React.lazy(() => import('../pages/standard/compliance/CompliancePage'))

const { Header, Sider, Content } = Layout

const topNavItems = [
  { key: 'standard', label: '数据标准' },
  { key: 'datamgr', label: '数据管理' },
  { key: 'quality', label: '数据质量' },
  { key: 'control', label: '数据管控' },
  { key: 'service', label: '数据服务' },
  { key: 'operation', label: '数据运行' },
  { key: 'alarm', label: '数据告警' },
]

const sideMenuConfig: Record<string, { key: string; icon: React.ReactNode; label: string; path: string }[]> = {
  standard: [
    { key: 'dashboard', icon: <HomeOutlined />, label: '首页', path: '/standard/dashboard' },
    { key: 'document', icon: <FileTextOutlined />, label: '标准文档', path: '/standard/document' },
    { key: 'data', icon: <DatabaseOutlined />, label: '数据标准', path: '/standard/data' },
    { key: 'mapping', icon: <NodeIndexOutlined />, label: '落标映射管理', path: '/standard/mapping' },
    { key: 'compliance', icon: <AuditOutlined />, label: '标准符合性检测', path: '/standard/compliance' },
  ],
}

interface TabItem {
  key: string
  label: string
  path: string
}

const MainLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTopNav, setActiveTopNav] = useState('standard')
  const [tabs, setTabs] = useState<TabItem[]>([{ key: 'dashboard', label: '首页', path: '/standard/dashboard' }])
  const [collapsed, setCollapsed] = useState(false)

  const currentSideMenu = useMemo(() => sideMenuConfig[activeTopNav] || [], [activeTopNav])

  const activeSideKey = useMemo(() => {
    const item = currentSideMenu.find(m => location.pathname.startsWith(m.path))
    return item?.key || ''
  }, [location.pathname, currentSideMenu])

  const handleTopNavClick = (key: string) => {
    setActiveTopNav(key)
    if (key === 'standard') {
      navigate('/standard/dashboard')
    }
  }

  const handleSideMenuClick = (key: string) => {
    const item = currentSideMenu.find(m => m.key === key)
    if (!item) return
    navigate(item.path)
    if (!tabs.find(t => t.key === key)) {
      setTabs(prev => [...prev, { key, label: item.label, path: item.path }])
    }
  }

  const handleTabChange = (key: string) => {
    const tab = tabs.find(t => t.key === key)
    if (tab) navigate(tab.path)
  }

  const handleTabClose = (targetKey: string) => {
    const newTabs = tabs.filter(t => t.key !== targetKey)
    if (newTabs.length === 0) {
      setTabs([{ key: 'dashboard', label: '首页', path: '/standard/dashboard' }])
      navigate('/standard/dashboard')
      return
    }
    if (activeSideKey === targetKey) {
      navigate(newTabs[newTabs.length - 1].path)
    }
    setTabs(newTabs)
  }

  const handleLogout = () => {
    Cookies.remove('access_token')
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        background: 'linear-gradient(90deg, #0d2b5e 0%, #1a4fa0 100%)',
        height: '48px',
        lineHeight: '48px',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '40px', cursor: 'pointer' }} onClick={() => navigate('/standard/dashboard')}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginRight: '10px',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <span style={{ color: '#fff', fontSize: '16px', fontWeight: 600, whiteSpace: 'nowrap' }}>
            湖南数据要素平台系统
          </span>
        </div>

        <div style={{ display: 'flex', flex: 1 }}>
          {topNavItems.map(item => (
            <div key={item.key}
              onClick={() => handleTopNavClick(item.key)}
              style={{
                padding: '0 20px', cursor: 'pointer', height: '48px',
                lineHeight: '48px', color: activeTopNav === item.key ? '#fff' : 'rgba(255,255,255,0.7)',
                fontSize: '14px', fontWeight: activeTopNav === item.key ? 600 : 400,
                borderBottom: activeTopNav === item.key ? '2px solid #fff' : '2px solid transparent',
                transition: 'all 0.3s',
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        <Space size={16} style={{ color: 'rgba(255,255,255,0.8)' }}>
          <SearchOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
          <BellOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
          <Dropdown menu={{
            items: [
              { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
            ],
          }}>
            <Space style={{ cursor: 'pointer', color: '#fff' }}>
              <Avatar size={28} icon={<UserOutlined />} style={{ background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: '14px' }}>User</span>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        <Sider width={200} collapsible collapsed={collapsed} onCollapse={setCollapsed}
          style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <Menu
            mode="inline"
            selectedKeys={[activeSideKey]}
            onClick={({ key }) => handleSideMenuClick(key)}
            style={{ height: '100%', borderRight: 0, paddingTop: '8px' }}
            items={currentSideMenu.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
            }))}
          />
        </Sider>

        <Layout style={{ background: '#f5f7fa' }}>
          <div style={{ background: '#fff', padding: '0 16px', borderBottom: '1px solid #f0f0f0' }}>
            <Tabs
              type="editable-card"
              hideAdd
              activeKey={activeSideKey}
              onChange={handleTabChange}
              onEdit={(targetKey, action) => {
                if (action === 'remove') handleTabClose(targetKey as string)
              }}
              items={tabs.map(tab => ({ key: tab.key, label: tab.label }))}
              size="small"
              style={{ marginBottom: 0 }}
            />
          </div>

          <Content style={{ padding: '16px', overflow: 'auto' }}>
            <Suspense fallback={<Spin spinning tip="加载中..." style={{ display: 'flex', justifyContent: 'center', marginTop: '200px' }} />}>
              <Routes>
                <Route path="standard/dashboard" element={<DashboardPage />} />
                <Route path="standard/document/*" element={<DocumentPage />} />
                <Route path="standard/data/*" element={<DataStandardPage />} />
                <Route path="standard/mapping/*" element={<MappingPage />} />
                <Route path="standard/compliance" element={<CompliancePage />} />
                <Route path="*" element={<Navigate to="/standard/dashboard" replace />} />
              </Routes>
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default MainLayout
