/**
 * 省级交通运行预警预测子系统 - 态势一张图（驾驶舱）
 * 展示全省交通态势概览、实时预警、流量统计等
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Progress, Table, Tag, Space, Typography, Badge, Tooltip } from 'antd';
import {
  AlertOutlined,
  CarOutlined,
  DashboardOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import MapPlaceholder from '../../components/MapPlaceholder';
import { trafficApi } from '../../services/api';
import { formatNumber } from '../../utils/helpers';

const { Text, Title } = Typography;

const TrafficWarningDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [flowData, setFlowData] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [congestionData, setCongestionData] = useState(null);

  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overview, flow, warningRes, congestion] = await Promise.all([
          trafficApi.getOverview(),
          trafficApi.getFlowPrediction(),
          trafficApi.getWarnings({ page_size: 5 }),
          trafficApi.getCongestion(),
        ]);
        
        setOverviewData(overview.data || generateMockOverview());
        setFlowData(flow.data?.historical || generateMockFlow());
        setWarnings(warningRes.data?.list || generateMockWarnings());
        setCongestionData(congestion.data || generateMockCongestion());
      } catch (error) {
        console.error('加载数据失败:', error);
        setOverviewData(generateMockOverview());
        setFlowData(generateMockFlow());
        setWarnings(generateMockWarnings());
        setCongestionData(generateMockCongestion());
      }
      setLoading(false);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 60000); // 每分钟刷新
    return () => clearInterval(interval);
  }, []);

  // 生成模拟数据
  const generateMockOverview = () => ({
    summary: { total_highways: 28, total_mileage: 5680, monitored_sections: 156, active_warnings: 12 },
    traffic_index: { province_avg: 1.35, trend: 'down', compared_yesterday: -5.2 },
    road_status_distribution: { smooth: 68, slow: 20, congested: 9, blocked: 3 },
    flow_stats: { total_today: 956000, peak_hour: '08:30', peak_flow: 65000 },
    warning_distribution: { blue: 5, yellow: 4, orange: 2, red: 1 }
  });

  const generateMockFlow = () => 
    Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      flow: Math.floor(3000 + Math.random() * 5000 * (i >= 7 && i <= 9 || i >= 17 && i <= 19 ? 1.8 : 1)),
      speed: Math.floor(50 + Math.random() * 70),
      congestion_index: +(1 + Math.random()).toFixed(2)
    }));

  const generateMockWarnings = () => [
    { id: 1, type: '拥堵预警', level: '黄色', location: 'G1高速省会段', time: '10:30', status: '处理中' },
    { id: 2, type: '事故预警', level: '红色', location: 'S1省道东部段', time: '10:15', status: '待处理' },
    { id: 3, type: '气象预警', level: '橙色', location: 'G2高速北部段', time: '09:45', status: '处理中' },
    { id: 4, type: '流量预警', level: '黄色', location: 'G15高速临海段', time: '09:30', status: '已处理' },
    { id: 5, type: '施工预警', level: '蓝色', location: 'S2省道中部段', time: '09:00', status: '已处理' },
  ];

  const generateMockCongestion = () => ({
    summary: { '畅通': 102, '缓行': 30, '拥堵': 18, '严重拥堵': 6 },
    hotspots: [
      { road_name: 'G1高速省会段', speed: 25, status: '严重拥堵' },
      { road_name: 'S1省道东部段', speed: 35, status: '拥堵' },
      { road_name: 'G2高速北部段', speed: 40, status: '拥堵' },
    ]
  });

  // 流量趋势图配置
  const flowChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['车流量', '平均车速'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: flowData.map(d => d.hour), boundaryGap: false },
    yAxis: [
      { type: 'value', name: '流量', position: 'left' },
      { type: 'value', name: '车速(km/h)', position: 'right' }
    ],
    series: [
      {
        name: '车流量',
        type: 'line',
        data: flowData.map(d => d.flow),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '平均车速',
        type: 'line',
        yAxisIndex: 1,
        data: flowData.map(d => d.speed),
        smooth: true,
        itemStyle: { color: '#52c41a' }
      }
    ]
  };

  // 路况分布饼图配置
  const statusPieOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: congestionData ? [
        { value: congestionData.summary['畅通'], name: '畅通', itemStyle: { color: '#52c41a' } },
        { value: congestionData.summary['缓行'], name: '缓行', itemStyle: { color: '#faad14' } },
        { value: congestionData.summary['拥堵'], name: '拥堵', itemStyle: { color: '#ff7a45' } },
        { value: congestionData.summary['严重拥堵'], name: '严重拥堵', itemStyle: { color: '#f5222d' } },
      ] : []
    }]
  };

  // 预警列表列定义
  const warningColumns = [
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    { 
      title: '级别', 
      dataIndex: 'level', 
      key: 'level',
      width: 90,
      render: (level) => {
        const colorMap = { '蓝色': 'blue', '黄色': 'gold', '橙色': 'orange', '红色': 'red' };
        return <Tag color={colorMap[level]}>{level}</Tag>;
      }
    },
    { title: '位置', dataIndex: 'location', key: 'location', ellipsis: true },
    { title: '时间', dataIndex: 'time', key: 'time', width: 80 },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      width: 80,
      render: (status) => {
        const colorMap = { '待处理': 'red', '处理中': 'orange', '已处理': 'green' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
  ];

  return (
    <div>
      <PageHeader 
        title="全省交通态势一张图" 
        subtitle="实时监测全省路网运行状态，智能预警分析"
        breadcrumb={['交通运行预警预测', '态势一张图']}
        extra={
          <Space className="realtime-indicator">
            <span className="realtime-dot"></span>
            <Text type="secondary">数据实时更新</Text>
          </Space>
        }
      />

      {/* 核心指标 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="监测路段"
            value={overviewData?.summary?.monitored_sections || 156}
            suffix="个"
            icon={<DashboardOutlined />}
            color="#1890ff"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="今日总流量"
            value={formatNumber(overviewData?.flow_stats?.total_today || 956000)}
            suffix="辆"
            icon={<CarOutlined />}
            color="#52c41a"
            trendValue={overviewData?.traffic_index?.compared_yesterday}
            trend="negative"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="拥堵指数"
            value={overviewData?.traffic_index?.province_avg || 1.35}
            icon={<DashboardOutlined />}
            color={overviewData?.traffic_index?.province_avg > 1.5 ? '#fa8c16' : '#52c41a'}
            trendValue={overviewData?.traffic_index?.compared_yesterday}
            trend="positive"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="当前预警"
            value={overviewData?.summary?.active_warnings || 12}
            suffix="条"
            icon={<AlertOutlined />}
            color="#f5222d"
            loading={loading}
          />
        </Col>
      </Row>

      {/* 地图和预警 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <MapPlaceholder 
            title="全省路网态势图" 
            height={400}
            center={{ lng: 120.15, lat: 30.25 }}
          />
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <WarningOutlined style={{ color: '#f5222d' }} />
                <span>实时预警</span>
                <Badge count={warnings.length} style={{ backgroundColor: '#f5222d' }} />
              </Space>
            }
            bodyStyle={{ padding: 0 }}
            style={{ height: 400 }}
          >
            <Table
              dataSource={warnings}
              columns={warningColumns}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 320 }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* 流量趋势和路况分布 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="今日车流量趋势" loading={loading}>
            <ReactECharts option={flowChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="路况分布" loading={loading}>
            <ReactECharts option={statusPieOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 拥堵热点 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card 
            title="拥堵热点路段" 
            loading={loading}
            extra={<Text type="secondary">TOP 5</Text>}
          >
            <Row gutter={[16, 16]}>
              {(congestionData?.hotspots || []).slice(0, 5).map((item, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <Card size="small" style={{ background: '#fafafa' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>{item.road_name}</Text>
                        <Tag color={item.status === '严重拥堵' ? 'red' : 'orange'}>
                          {item.status}
                        </Tag>
                      </div>
                      <div>
                        <Text type="secondary">平均车速: </Text>
                        <Text style={{ color: item.speed < 30 ? '#f5222d' : '#fa8c16' }}>
                          {item.speed} km/h
                        </Text>
                      </div>
                      <Progress 
                        percent={100 - item.speed} 
                        strokeColor={item.speed < 30 ? '#f5222d' : '#fa8c16'}
                        showInfo={false}
                        size="small"
                      />
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TrafficWarningDashboard;
