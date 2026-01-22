/**
 * 省级基础设施监测预警子系统 - 监测驾驶舱
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Typography, Space, Badge, Table, Tag } from 'antd';
import {
  BuildOutlined, AlertOutlined, CheckCircleOutlined, WifiOutlined, ToolOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import MapPlaceholder from '../../components/MapPlaceholder';
import { infrastructureApi } from '../../services/api';

const { Text, Title } = Typography;

const InfrastructureDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboard, alertRes] = await Promise.all([
        infrastructureApi.getDashboard(),
        infrastructureApi.getAlerts({ page_size: 5 }),
      ]);
      setDashboardData(dashboard.data?.stats || generateMockDashboard());
      setAlerts(alertRes.data?.list || generateMockAlerts());
    } catch (error) {
      setDashboardData(generateMockDashboard());
      setAlerts(generateMockAlerts());
    }
    setLoading(false);
  };

  const generateMockDashboard = () => ({
    total_facilities: 156,
    bridges: 45,
    tunnels: 28,
    toll_stations: 38,
    service_areas: 25,
    monitoring_centers: 20,
    health_excellent: 98,
    health_good: 35,
    health_average: 18,
    health_poor: 5,
    alerts_today: 8,
    inspections_month: 75,
    online_sensors: 1350,
    offline_sensors: 15,
  });

  const generateMockAlerts = () => [
    { id: 1, facility: '省会大桥01', fault_type: '传感器离线', status: '未处理', time: '10:30' },
    { id: 2, facility: '东部隧道03', fault_type: '数据异常', status: '处理中', time: '09:45' },
    { id: 3, facility: '西部收费站02', fault_type: '通信中断', status: '已处理', time: '08:20' },
  ];

  // 设施分布图配置
  const facilityChartOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: dashboardData ? [
        { value: dashboardData.bridges, name: '桥梁', itemStyle: { color: '#1890ff' } },
        { value: dashboardData.tunnels, name: '隧道', itemStyle: { color: '#722ed1' } },
        { value: dashboardData.toll_stations, name: '收费站', itemStyle: { color: '#52c41a' } },
        { value: dashboardData.service_areas, name: '服务区', itemStyle: { color: '#fa8c16' } },
        { value: dashboardData.monitoring_centers, name: '监控中心', itemStyle: { color: '#13c2c2' } },
      ] : []
    }]
  };

  // 健康状态分布图配置
  const healthChartOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['优良', '良好', '一般', '较差'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: dashboardData ? [
        { value: dashboardData.health_excellent, itemStyle: { color: '#52c41a' } },
        { value: dashboardData.health_good, itemStyle: { color: '#1890ff' } },
        { value: dashboardData.health_average, itemStyle: { color: '#faad14' } },
        { value: dashboardData.health_poor, itemStyle: { color: '#f5222d' } },
      ] : [],
      barWidth: 40,
    }]
  };

  const alertColumns = [
    { title: '设施', dataIndex: 'facility', key: 'facility' },
    { title: '故障类型', dataIndex: 'fault_type', key: 'fault_type' },
    { 
      title: '状态', dataIndex: 'status', key: 'status',
      render: (status) => {
        const colorMap = { '未处理': 'red', '处理中': 'orange', '已处理': 'green' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    { title: '时间', dataIndex: 'time', key: 'time', width: 80 },
  ];

  return (
    <div>
      <PageHeader 
        title="监测数据驾驶舱" 
        subtitle="全省基础设施运行状态总览"
        breadcrumb={['基础设施监测', '监测驾驶舱']}
        extra={
          <Space className="realtime-indicator">
            <span className="realtime-dot"></span>
            <Text type="secondary">实时监测中</Text>
          </Space>
        }
      />

      {/* 核心指标 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="设施总数" value={dashboardData?.total_facilities || 156} suffix="个" icon={<BuildOutlined />} color="#1890ff" loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="在线传感器" value={dashboardData?.online_sensors || 1350} suffix="个" icon={<WifiOutlined />} color="#52c41a" loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="今日报警" value={dashboardData?.alerts_today || 8} suffix="条" icon={<AlertOutlined />} color="#f5222d" loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="本月巡检" value={dashboardData?.inspections_month || 75} suffix="次" icon={<ToolOutlined />} color="#722ed1" loading={loading} />
        </Col>
      </Row>

      {/* 地图和设施分布 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <MapPlaceholder 
            title="基础设施分布图" 
            height={400}
            legendItems={[
              { color: '#1890ff', label: '桥梁' },
              { color: '#722ed1', label: '隧道' },
              { color: '#52c41a', label: '收费站' },
              { color: '#fa8c16', label: '服务区' },
            ]}
          />
        </Col>
        <Col xs={24} lg={8}>
          <Card title="设施类型分布" style={{ height: 400 }} loading={loading}>
            <ReactECharts option={facilityChartOption} style={{ height: 340 }} />
          </Card>
        </Col>
      </Row>

      {/* 健康状态和报警列表 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="设施健康状态分布" loading={loading}>
            <ReactECharts option={healthChartOption} style={{ height: 250 }} />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={6}><div style={{ textAlign: 'center' }}><Progress type="circle" percent={Math.round(dashboardData?.health_excellent / dashboardData?.total_facilities * 100)} size={60} strokeColor="#52c41a" /><div style={{ marginTop: 8 }}>优良</div></div></Col>
              <Col span={6}><div style={{ textAlign: 'center' }}><Progress type="circle" percent={Math.round(dashboardData?.health_good / dashboardData?.total_facilities * 100)} size={60} strokeColor="#1890ff" /><div style={{ marginTop: 8 }}>良好</div></div></Col>
              <Col span={6}><div style={{ textAlign: 'center' }}><Progress type="circle" percent={Math.round(dashboardData?.health_average / dashboardData?.total_facilities * 100)} size={60} strokeColor="#faad14" /><div style={{ marginTop: 8 }}>一般</div></div></Col>
              <Col span={6}><div style={{ textAlign: 'center' }}><Progress type="circle" percent={Math.round(dashboardData?.health_poor / dashboardData?.total_facilities * 100)} size={60} strokeColor="#f5222d" /><div style={{ marginTop: 8 }}>较差</div></div></Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={<Space><AlertOutlined style={{ color: '#f5222d' }} />最新报警</Space>}
            extra={<Badge count={alerts.filter(a => a.status === '未处理').length} />}
            loading={loading}
          >
            <Table dataSource={alerts} columns={alertColumns} rowKey="id" pagination={false} size="small" />
            
            <Card size="small" style={{ marginTop: 16, background: '#f6ffed' }}>
              <Row>
                <Col span={8}><Statistic title="传感器在线率" value={(dashboardData?.online_sensors / (dashboardData?.online_sensors + dashboardData?.offline_sensors) * 100).toFixed(1)} suffix="%" valueStyle={{ color: '#52c41a' }} /></Col>
                <Col span={8}><Statistic title="离线传感器" value={dashboardData?.offline_sensors} valueStyle={{ color: '#f5222d' }} /></Col>
                <Col span={8}><Statistic title="健康设施占比" value={((dashboardData?.health_excellent + dashboardData?.health_good) / dashboardData?.total_facilities * 100).toFixed(1)} suffix="%" valueStyle={{ color: '#1890ff' }} /></Col>
              </Row>
            </Card>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InfrastructureDashboard;
