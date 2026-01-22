/**
 * 省级交通应急指挥调度管理子系统 - 应急概览
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, Progress, Typography, Badge, Timeline } from 'antd';
import {
  ThunderboltOutlined,
  TeamOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import MapPlaceholder from '../../components/MapPlaceholder';
import { emergencyApi } from '../../services/api';

const { Text, Title } = Typography;

const EmergencyOverview = () => {
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overview, events, resourceRes] = await Promise.all([
        emergencyApi.getOverview(),
        emergencyApi.getEvents({ page_size: 5 }),
        emergencyApi.getResources({ page_size: 10 }),
      ]);
      setOverviewData(overview.data || generateMockOverview());
      setRecentEvents(events.data?.list || generateMockEvents());
      setResources(resourceRes.data?.list || generateMockResources());
    } catch (error) {
      setOverviewData(generateMockOverview());
      setRecentEvents(generateMockEvents());
      setResources(generateMockResources());
    }
    setLoading(false);
  };

  const generateMockOverview = () => ({
    resource_summary: { total: 156, standby: 120, dispatched: 28, maintenance: 8 },
    resource_by_type: {
      rescue_vehicle: 35, fire_truck: 25, ambulance: 30,
      tow_truck: 35, patrol_car: 25, command_vehicle: 6
    },
    event_stats: { today_total: 12, pending: 3, processing: 5, completed: 4 },
    response_time_avg: '15分钟',
    duty_today: { morning: '张明', afternoon: '李华', night: '王强' }
  });

  const generateMockEvents = () => [
    { id: 1, event_no: 'EV20240115001', type: '交通事故', level: '较大', location: 'G1高速K125', status: '处理中', report_time: '10:30' },
    { id: 2, event_no: 'EV20240115002', type: '车辆故障', level: '一般', location: 'S1省道K80', status: '已调度', report_time: '09:45' },
    { id: 3, event_no: 'EV20240115003', type: '道路施工', level: '一般', location: 'G2高速K200', status: '已完成', report_time: '08:20' },
  ];

  const generateMockResources = () => [
    { id: 1, name: '救援车001', type: '救援车辆', status: '待命', location: '省会市' },
    { id: 2, name: '消防车003', type: '消防车', status: '执行中', location: '东部市' },
    { id: 3, name: '救护车005', type: '救护车', status: '待命', location: '西部市' },
  ];

  // 资源分布图配置
  const resourceChartOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 'center' },
    series: [{
      type: 'pie',
      radius: '60%',
      center: ['60%', '50%'],
      data: overviewData ? [
        { value: overviewData.resource_by_type.rescue_vehicle, name: '救援车辆', itemStyle: { color: '#1890ff' } },
        { value: overviewData.resource_by_type.fire_truck, name: '消防车', itemStyle: { color: '#f5222d' } },
        { value: overviewData.resource_by_type.ambulance, name: '救护车', itemStyle: { color: '#52c41a' } },
        { value: overviewData.resource_by_type.tow_truck, name: '清障车', itemStyle: { color: '#faad14' } },
        { value: overviewData.resource_by_type.patrol_car, name: '巡逻车', itemStyle: { color: '#722ed1' } },
        { value: overviewData.resource_by_type.command_vehicle, name: '指挥车', itemStyle: { color: '#13c2c2' } },
      ] : [],
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  };

  const eventColumns = [
    { title: '事件编号', dataIndex: 'event_no', key: 'event_no', width: 140 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
    { 
      title: '级别', dataIndex: 'level', key: 'level', width: 70,
      render: (level) => {
        const colorMap = { '一般': 'blue', '较大': 'gold', '重大': 'orange', '特大': 'red' };
        return <Tag color={colorMap[level]}>{level}</Tag>;
      }
    },
    { title: '位置', dataIndex: 'location', key: 'location', ellipsis: true },
    { 
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (status) => {
        const colorMap = { '待处理': 'red', '处理中': 'orange', '已调度': 'blue', '已完成': 'green' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
  ];

  return (
    <div>
      <PageHeader 
        title="应急指挥概览" 
        subtitle="实时监控应急资源状态，快速响应处置事件"
        breadcrumb={['应急指挥调度', '应急概览']}
      />

      {/* 核心指标 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="应急资源总数"
            value={overviewData?.resource_summary?.total || 156}
            suffix="个"
            icon={<TeamOutlined />}
            color="#1890ff"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="待命资源"
            value={overviewData?.resource_summary?.standby || 120}
            suffix="个"
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="今日事件"
            value={overviewData?.event_stats?.today_total || 12}
            suffix="起"
            icon={<AlertOutlined />}
            color="#faad14"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="平均响应时间"
            value={overviewData?.response_time_avg || '15分钟'}
            icon={<ClockCircleOutlined />}
            color="#722ed1"
            loading={loading}
          />
        </Col>
      </Row>

      {/* 地图和资源分布 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <MapPlaceholder 
            title="应急资源分布图" 
            height={400}
            legendItems={[
              { color: '#52c41a', label: '待命' },
              { color: '#1890ff', label: '执行中' },
              { color: '#faad14', label: '维护中' },
            ]}
          />
        </Col>
        <Col xs={24} lg={8}>
          <Card title="资源类型分布" style={{ height: 400 }} loading={loading}>
            <ReactECharts option={resourceChartOption} style={{ height: 340 }} />
          </Card>
        </Col>
      </Row>

      {/* 事件列表和值班信息 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={<Space><ThunderboltOutlined />最近事件</Space>}
            extra={<Badge count={overviewData?.event_stats?.pending || 3} />}
            loading={loading}
          >
            <Table
              dataSource={recentEvents}
              columns={eventColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="今日值班" loading={loading}>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <Text strong>早班 (08:00-16:00)</Text>
                      <br />
                      <Space>
                        <TeamOutlined />
                        <Text>{overviewData?.duty_today?.morning || '张明'}</Text>
                        <PhoneOutlined />
                        <Text type="secondary">138****1234</Text>
                      </Space>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <Text strong>中班 (16:00-24:00)</Text>
                      <br />
                      <Space>
                        <TeamOutlined />
                        <Text>{overviewData?.duty_today?.afternoon || '李华'}</Text>
                        <PhoneOutlined />
                        <Text type="secondary">139****5678</Text>
                      </Space>
                    </div>
                  ),
                },
                {
                  color: 'gray',
                  children: (
                    <div>
                      <Text strong>晚班 (00:00-08:00)</Text>
                      <br />
                      <Space>
                        <TeamOutlined />
                        <Text>{overviewData?.duty_today?.night || '王强'}</Text>
                        <PhoneOutlined />
                        <Text type="secondary">137****9012</Text>
                      </Space>
                    </div>
                  ),
                },
              ]}
            />
            
            <Card size="small" style={{ marginTop: 16, background: '#f6ffed' }}>
              <Row>
                <Col span={12}>
                  <Statistic 
                    title="待处理事件" 
                    value={overviewData?.event_stats?.pending || 3}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="处理中事件" 
                    value={overviewData?.event_stats?.processing || 5}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
            </Card>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmergencyOverview;
