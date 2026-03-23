import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography } from 'antd'
import {
  DatabaseOutlined,
  AuditOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  BookOutlined,
  FileTextOutlined,
  AlertOutlined,
} from '@ant-design/icons'
import DataSourcePage from './pages/DataSourcePage'
import RuleGroupPage from './pages/RuleGroupPage'
import RuleDetailPage from './pages/RuleDetailPage'
import ExecutionPage from './pages/ExecutionPage'
import DictPage from './pages/DictPage'
import ReportPage from './pages/ReportPage'
import WorkOrderPage from './pages/WorkOrderPage'
import RuleTypeConfigPage from './pages/RuleTypeConfigPage'

const { Header, Content, Sider } = Layout

const menuItems = [
  { key: '/datasource', icon: <DatabaseOutlined />, label: '数据源管理' },
  { key: '/rule-group', icon: <AuditOutlined />, label: '规则组管理' },
  { key: '/execution', icon: <PlayCircleOutlined />, label: '规则执行' },
  { key: '/report', icon: <FileTextOutlined />, label: '质量报告' },
  { key: '/work-order', icon: <AlertOutlined />, label: '问题处置工单' },
  { key: '/rule-type', icon: <SettingOutlined />, label: '规则类型管理' },
  { key: '/dict', icon: <BookOutlined />, label: '字典管理' },
]

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentKey = '/' + (location.pathname.split('/')[1] || 'datasource')

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
          <SettingOutlined style={{ fontSize: 22, color: '#fff', marginRight: 8 }} />
          <Typography.Title level={5} style={{ color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>
            数据要素平台
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Typography.Title level={4} style={{ margin: '16px 0' }}>
            数据要素平台 - 规则引擎
          </Typography.Title>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 360 }}>
          <Routes>
            <Route path="/" element={<DataSourcePage />} />
            <Route path="/datasource" element={<DataSourcePage />} />
            <Route path="/rule-group" element={<RuleGroupPage />} />
            <Route path="/rule-group/:groupId/rules" element={<RuleDetailPage />} />
            <Route path="/execution" element={<ExecutionPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/work-order" element={<WorkOrderPage />} />
            <Route path="/rule-type" element={<RuleTypeConfigPage />} />
            <Route path="/dict" element={<DictPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
