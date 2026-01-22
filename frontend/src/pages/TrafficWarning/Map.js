/**
 * 省级交通运行预警预测子系统 - 路网监测
 * 展示路网实时状态、拥堵情况、流量数据
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Space, Select, Input, Button, Statistic, Descriptions } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  CarOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import MapPlaceholder from '../../components/MapPlaceholder';
import { RoadStatusTag } from '../../components/StatusTag';
import { trafficApi } from '../../services/api';

const { Option } = Select;
const { Search } = Input;

const TrafficWarningMap = () => {
  const [loading, setLoading] = useState(false);
  const [roadData, setRoadData] = useState([]);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // 加载数据
  useEffect(() => {
    fetchRoadData();
  }, []);

  const fetchRoadData = async () => {
    setLoading(true);
    try {
      const res = await trafficApi.getCongestion();
      setRoadData(res.data?.roads || generateMockRoads());
    } catch (error) {
      setRoadData(generateMockRoads());
    }
    setLoading(false);
  };

  // 生成模拟数据
  const generateMockRoads = () => {
    const highways = ['G1高速', 'G2高速', 'G3高速', 'S1省道', 'S2省道', 'G15高速', 'G25高速'];
    const cities = ['省会市', '东部市', '西部市', '南部市', '北部市'];
    const statuses = ['畅通', '缓行', '拥堵', '严重拥堵'];
    
    return Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      road_name: `${highways[i % highways.length]}${cities[i % cities.length]}段`,
      start_point: `${cities[i % cities.length]}入口`,
      end_point: `${cities[(i + 1) % cities.length]}出口`,
      length: +(10 + Math.random() * 70).toFixed(1),
      status: statuses[Math.floor(Math.random() * 4)],
      speed: Math.floor(20 + Math.random() * 100),
      flow: Math.floor(500 + Math.random() * 4500),
      location: { lng: 119 + Math.random() * 3, lat: 29 + Math.random() * 2 }
    }));
  };

  // 筛选数据
  const filteredData = statusFilter === 'all' 
    ? roadData 
    : roadData.filter(r => r.status === statusFilter);

  // 表格列定义
  const columns = [
    { 
      title: '路段名称', 
      dataIndex: 'road_name', 
      key: 'road_name',
      render: (text, record) => (
        <a onClick={() => setSelectedRoad(record)}>
          <EnvironmentOutlined style={{ marginRight: 4 }} />
          {text}
        </a>
      )
    },
    { title: '起点', dataIndex: 'start_point', key: 'start_point', width: 100 },
    { title: '终点', dataIndex: 'end_point', key: 'end_point', width: 100 },
    { title: '里程(km)', dataIndex: 'length', key: 'length', width: 90 },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      width: 100,
      render: (status) => <RoadStatusTag status={status} />
    },
    { 
      title: '车速(km/h)', 
      dataIndex: 'speed', 
      key: 'speed',
      width: 100,
      render: (speed) => (
        <span style={{ color: speed < 30 ? '#f5222d' : speed < 60 ? '#fa8c16' : '#52c41a' }}>
          {speed}
        </span>
      )
    },
    { 
      title: '流量(辆/h)', 
      dataIndex: 'flow', 
      key: 'flow',
      width: 100,
      render: (flow) => flow.toLocaleString()
    },
  ];

  // 统计信息
  const statusCounts = {
    total: roadData.length,
    smooth: roadData.filter(r => r.status === '畅通').length,
    slow: roadData.filter(r => r.status === '缓行').length,
    congested: roadData.filter(r => r.status === '拥堵').length,
    blocked: roadData.filter(r => r.status === '严重拥堵').length,
  };

  return (
    <div>
      <PageHeader 
        title="路网监测" 
        subtitle="实时监测全省路网运行状态，掌握各路段拥堵和流量情况"
        breadcrumb={['交通运行预警预测', '路网监测']}
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchRoadData} loading={loading}>
            刷新数据
          </Button>
        }
      />

      {/* 状态统计 */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic title="监测路段" value={statusCounts.total} suffix="个" />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={5}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title="畅通" value={statusCounts.smooth} valueStyle={{ color: '#52c41a' }} suffix="个" />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={5}>
          <Card size="small" style={{ borderLeft: '3px solid #faad14' }}>
            <Statistic title="缓行" value={statusCounts.slow} valueStyle={{ color: '#faad14' }} suffix="个" />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={5}>
          <Card size="small" style={{ borderLeft: '3px solid #ff7a45' }}>
            <Statistic title="拥堵" value={statusCounts.congested} valueStyle={{ color: '#ff7a45' }} suffix="个" />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={5}>
          <Card size="small" style={{ borderLeft: '3px solid #f5222d' }}>
            <Statistic title="严重拥堵" value={statusCounts.blocked} valueStyle={{ color: '#f5222d' }} suffix="个" />
          </Card>
        </Col>
      </Row>

      {/* 地图和列表 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <MapPlaceholder 
            title="路网状态图" 
            height={500}
            markers={roadData.slice(0, 20)}
          />
        </Col>
        <Col xs={24} lg={10}>
          {selectedRoad ? (
            <Card 
              title={
                <Space>
                  <EnvironmentOutlined />
                  {selectedRoad.road_name}
                </Space>
              }
              extra={<a onClick={() => setSelectedRoad(null)}>返回列表</a>}
              style={{ height: 500 }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="起点">{selectedRoad.start_point}</Descriptions.Item>
                <Descriptions.Item label="终点">{selectedRoad.end_point}</Descriptions.Item>
                <Descriptions.Item label="里程">{selectedRoad.length} km</Descriptions.Item>
                <Descriptions.Item label="当前状态">
                  <RoadStatusTag status={selectedRoad.status} />
                </Descriptions.Item>
                <Descriptions.Item label="平均车速">
                  <span style={{ 
                    color: selectedRoad.speed < 30 ? '#f5222d' : 
                           selectedRoad.speed < 60 ? '#fa8c16' : '#52c41a',
                    fontSize: 20,
                    fontWeight: 600
                  }}>
                    {selectedRoad.speed} km/h
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="小时流量">
                  <span style={{ fontSize: 20, fontWeight: 600 }}>
                    {selectedRoad.flow.toLocaleString()} 辆/h
                  </span>
                </Descriptions.Item>
              </Descriptions>
              
              <Card size="small" style={{ marginTop: 16, background: '#fafafa' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="拥堵指数" 
                      value={(100 - selectedRoad.speed) / 30} 
                      precision={2}
                      valueStyle={{ 
                        color: selectedRoad.speed < 30 ? '#f5222d' : '#faad14' 
                      }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="通行能力" 
                      value={Math.min(100, selectedRoad.speed)}
                      suffix="%"
                      valueStyle={{ 
                        color: selectedRoad.speed > 60 ? '#52c41a' : '#faad14' 
                      }}
                    />
                  </Col>
                </Row>
              </Card>
            </Card>
          ) : (
            <Card 
              title="路段列表"
              extra={
                <Select 
                  value={statusFilter} 
                  onChange={setStatusFilter}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="all">全部状态</Option>
                  <Option value="畅通">畅通</Option>
                  <Option value="缓行">缓行</Option>
                  <Option value="拥堵">拥堵</Option>
                  <Option value="严重拥堵">严重拥堵</Option>
                </Select>
              }
              bodyStyle={{ padding: 0 }}
              style={{ height: 500 }}
            >
              <Table
                dataSource={filteredData}
                columns={columns}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 8, size: 'small' }}
                loading={loading}
                scroll={{ y: 380 }}
                onRow={(record) => ({
                  onClick: () => setSelectedRoad(record),
                  style: { cursor: 'pointer' }
                })}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default TrafficWarningMap;
