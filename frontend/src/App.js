/**
 * 省级综合交通运输信息平台 - 主应用组件
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Space, Badge } from 'antd';
import {
  DashboardOutlined,
  AlertOutlined,
  ThunderboltOutlined,
  BuildOutlined,
  CarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons';

// 导入页面组件
import TrafficWarningDashboard from './pages/TrafficWarning/Dashboard';
import TrafficWarningMap from './pages/TrafficWarning/Map';
import TrafficWarningRules from './pages/TrafficWarning/Rules';
import TrafficWarningReport from './pages/TrafficWarning/Report';

import EmergencyOverview from './pages/EmergencyCommand/Overview';
import EmergencyResources from './pages/EmergencyCommand/Resources';
import EmergencyPlans from './pages/EmergencyCommand/Plans';
import EmergencyEvents from './pages/EmergencyCommand/Events';
import EmergencyDuty from './pages/EmergencyCommand/Duty';

import InfrastructureDashboard from './pages/Infrastructure/Dashboard';
import InfrastructureFacilities from './pages/Infrastructure/Facilities';
import InfrastructureAlerts from './pages/Infrastructure/Alerts';
import InfrastructureMobile from './pages/Infrastructure/Mobile';

import TravelMap from './pages/TravelService/Map';
import TravelServiceAreas from './pages/TravelService/ServiceAreas';
import TravelRescue from './pages/TravelService/Rescue';
import TravelRecommendations from './pages/TravelService/Recommendations';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

// 菜单配置
const menuItems = [
  {
    key: 'traffic-warning',
    icon: <AlertOutlined />,
    label: '交通运行预警预测',
    children: [
      { key: '/traffic-warning/dashboard', label: '态势一张图' },
      { key: '/traffic-warning/map', label: '路网监测' },
      { key: '/traffic-warning/rules', label: '预警规则配置' },
      { key: '/traffic-warning/report', label: '运行报表' },
    ],
  },
  {
    key: 'emergency',
    icon: <ThunderboltOutlined />,
    label: '应急指挥调度',
    children: [
      { key: '/emergency/overview', label: '应急概览' },
      { key: '/emergency/resources', label: '应急力量' },
      { key: '/emergency/plans', label: '应急预案' },
      { key: '/emergency/events', label: '事件处置' },
      { key: '/emergency/duty', label: '值班排班' },
    ],
  },
  {
    key: 'infrastructure',
    icon: <BuildOutlined />,
    label: '基础设施监测',
    children: [
      { key: '/infrastructure/dashboard', label: '监测驾驶舱' },
      { key: '/infrastructure/facilities', label: '设施档案' },
      { key: '/infrastructure/alerts', label: '故障报警' },
      { key: '/infrastructure/mobile', label: '移动端查询' },
    ],
  },
  {
    key: 'travel',
    icon: <CarOutlined />,
    label: '一张网出行服务',
    children: [
      { key: '/travel/map', label: '出行地图' },
      { key: '/travel/service-areas', label: '服务区预约' },
      { key: '/travel/rescue', label: '一键救援' },
      { key: '/travel/recommendations', label: '交旅融合' },
    ],
  },
];

// 根据路径获取父级菜单key
const getParentKey = (path) => {
  if (path.startsWith('/traffic-warning')) return 'traffic-warning';
  if (path.startsWith('/emergency')) return 'emergency';
  if (path.startsWith('/infrastructure')) return 'infrastructure';
  if (path.startsWith('/travel')) return 'travel';
  return 'traffic-warning';
};

// 主布局组件（在Router内部使用，可以访问路由hooks）
function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  
  // 根据当前路径设置选中的菜单项
  const [selectedKeys, setSelectedKeys] = useState([location.pathname]);
  const [openKeys, setOpenKeys] = useState([getParentKey(location.pathname)]);

  // 更新时间
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 监听路由变化，同步菜单状态
  useEffect(() => {
    setSelectedKeys([location.pathname]);
    setOpenKeys([getParentKey(location.pathname)]);
  }, [location.pathname]);

  // 菜单点击处理
  const handleMenuClick = ({ key }) => {
    // 只有子菜单项（以/开头的）才需要导航
    if (key.startsWith('/')) {
      setSelectedKeys([key]);
      navigate(key);
    }
  };

  // 处理子菜单展开
  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  return (
    <Layout className="app-container">
      {/* 侧边栏 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.1)',
        }}>
          <DashboardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          {!collapsed && (
            <Title level={5} style={{ 
              color: '#fff', 
              margin: '0 0 0 12px',
              whiteSpace: 'nowrap' 
            }}>
              交通运输平台
            </Title>
          )}
        </div>
        
        {/* 导航菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      {/* 主内容区 */}
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        {/* 顶部导航栏 */}
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <Space>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              style: { fontSize: 18, cursor: 'pointer' },
              onClick: () => setCollapsed(!collapsed),
            })}
            <span style={{ marginLeft: 12, color: '#001529', fontWeight: 500 }}>
              省级综合交通运输信息平台
            </span>
          </Space>
          
          <Space size={24}>
            <span className="realtime-indicator">
              <span className="realtime-dot"></span>
              <span style={{ color: '#8c8c8c', fontSize: 14 }}>{currentTime}</span>
            </span>
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>
            <Space style={{ cursor: 'pointer' }}>
              <UserOutlined />
              <span>管理员</span>
            </Space>
          </Space>
        </Header>
        
        {/* 内容区 */}
        <Content style={{
          margin: 16,
          minHeight: 'calc(100vh - 64px - 32px)',
        }}>
          <Routes>
            {/* 默认重定向 */}
            <Route path="/" element={<Navigate to="/traffic-warning/dashboard" replace />} />
            
            {/* 交通运行预警预测子系统 */}
            <Route path="/traffic-warning/dashboard" element={<TrafficWarningDashboard />} />
            <Route path="/traffic-warning/map" element={<TrafficWarningMap />} />
            <Route path="/traffic-warning/rules" element={<TrafficWarningRules />} />
            <Route path="/traffic-warning/report" element={<TrafficWarningReport />} />
            
            {/* 应急指挥调度管理子系统 */}
            <Route path="/emergency/overview" element={<EmergencyOverview />} />
            <Route path="/emergency/resources" element={<EmergencyResources />} />
            <Route path="/emergency/plans" element={<EmergencyPlans />} />
            <Route path="/emergency/events" element={<EmergencyEvents />} />
            <Route path="/emergency/duty" element={<EmergencyDuty />} />
            
            {/* 基础设施监测预警子系统 */}
            <Route path="/infrastructure/dashboard" element={<InfrastructureDashboard />} />
            <Route path="/infrastructure/facilities" element={<InfrastructureFacilities />} />
            <Route path="/infrastructure/alerts" element={<InfrastructureAlerts />} />
            <Route path="/infrastructure/mobile" element={<InfrastructureMobile />} />
            
            {/* 一张网出行服务子系统 */}
            <Route path="/travel/map" element={<TravelMap />} />
            <Route path="/travel/service-areas" element={<TravelServiceAreas />} />
            <Route path="/travel/rescue" element={<TravelRescue />} />
            <Route path="/travel/recommendations" element={<TravelRecommendations />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

// 根组件（提供Router上下文）
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
