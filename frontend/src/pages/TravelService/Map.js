/**
 * 省级一张网出行服务子系统 - 出行地图
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Checkbox, Space, Tag, Typography, List, Badge, Statistic } from 'antd';
import { EnvironmentOutlined, CloudOutlined, CarOutlined, ShopOutlined } from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import MapPlaceholder from '../../components/MapPlaceholder';
import { travelApi } from '../../services/api';

const { Text } = Typography;

const TravelMap = () => {
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState(null);
  const [layers, setLayers] = useState(['road', 'weather', 'service']);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const res = await travelApi.getMapData();
      setMapData(res.data || generateMockMapData());
    } catch (error) {
      setMapData(generateMockMapData());
    }
    setLoading(false);
  };

  const generateMockMapData = () => ({
    roads: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      road: `G${Math.ceil((i + 1) / 4)}高速`,
      section: `路段${i + 1}`,
      condition: ['畅通', '缓行', '拥堵', '管制'][Math.floor(Math.random() * 4)],
      color: ['#52c41a', '#faad14', '#ff7a45', '#f5222d'][Math.floor(Math.random() * 4)],
      speed: Math.floor(20 + Math.random() * 100),
    })),
    weather: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      station: `气象站${i + 1}`,
      weather: ['晴', '多云', '阴', '小雨', '雾'][Math.floor(Math.random() * 5)],
      weather_icon: ['☀️', '⛅', '☁️', '🌧️', '🌫️'][Math.floor(Math.random() * 5)],
      temperature: Math.floor(5 + Math.random() * 30),
      visibility: Math.floor(1 + Math.random() * 20),
    })),
    services: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `服务区${i + 1}`,
      highway: `G${Math.ceil((i + 1) / 2)}高速`,
      parking_available: Math.floor(20 + Math.random() * 100),
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
    })),
    layer_stats: {
      smooth_roads: 12,
      congested_roads: 5,
      service_areas: 8,
      weather_stations: 10,
    }
  });

  const layerOptions = [
    { label: '路况信息', value: 'road', icon: <CarOutlined /> },
    { label: '气象信息', value: 'weather', icon: <CloudOutlined /> },
    { label: '服务设施', value: 'service', icon: <ShopOutlined /> },
  ];

  const roadConditionColors = {
    '畅通': '#52c41a',
    '缓行': '#faad14',
    '拥堵': '#ff7a45',
    '管制': '#f5222d',
  };

  return (
    <div>
      <PageHeader 
        title="出行地图查询" 
        subtitle="查询路况、气象、服务设施信息"
        breadcrumb={['一张网出行服务', '出行地图']}
      />

      <Row gutter={[16, 16]}>
        {/* 左侧地图 */}
        <Col xs={24} lg={16}>
          <Card 
            title="出行地图"
            extra={
              <Checkbox.Group 
                options={layerOptions.map(l => ({ label: <Space>{l.icon}{l.label}</Space>, value: l.value }))}
                value={layers}
                onChange={setLayers}
              />
            }
            bodyStyle={{ padding: 0 }}
          >
            <MapPlaceholder 
              title="省级出行服务地图" 
              height={500}
              legendItems={[
                { color: '#52c41a', label: '畅通' },
                { color: '#faad14', label: '缓行' },
                { color: '#ff7a45', label: '拥堵' },
                { color: '#1890ff', label: '服务区' },
              ]}
            />
          </Card>
        </Col>

        {/* 右侧信息面板 */}
        <Col xs={24} lg={8}>
          {/* 统计信息 */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="畅通路段" value={mapData?.layer_stats?.smooth_roads || 0} suffix="条" valueStyle={{ color: '#52c41a' }} />
              </Col>
              <Col span={12}>
                <Statistic title="拥堵路段" value={mapData?.layer_stats?.congested_roads || 0} suffix="条" valueStyle={{ color: '#f5222d' }} />
              </Col>
            </Row>
          </Card>

          {/* 路况信息 */}
          {layers.includes('road') && (
            <Card 
              title={<span><CarOutlined /> 实时路况</span>} 
              size="small" 
              style={{ marginBottom: 16 }}
              loading={loading}
            >
              <List
                size="small"
                dataSource={(mapData?.roads || []).slice(0, 6)}
                renderItem={item => (
                  <List.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>{item.road} {item.section}</Text>
                      <Space>
                        <Tag color={roadConditionColors[item.condition]}>{item.condition}</Tag>
                        <Text type="secondary">{item.speed}km/h</Text>
                      </Space>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* 气象信息 */}
          {layers.includes('weather') && (
            <Card 
              title={<span><CloudOutlined /> 气象信息</span>} 
              size="small" 
              style={{ marginBottom: 16 }}
              loading={loading}
            >
              <List
                size="small"
                dataSource={(mapData?.weather || []).slice(0, 5)}
                renderItem={item => (
                  <List.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>{item.station}</Text>
                      <Space>
                        <span>{item.weather_icon}</span>
                        <Text>{item.weather}</Text>
                        <Text type="secondary">{item.temperature}°C</Text>
                      </Space>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* 服务设施 */}
          {layers.includes('service') && (
            <Card 
              title={<span><ShopOutlined /> 服务区</span>} 
              size="small"
              loading={loading}
            >
              <List
                size="small"
                dataSource={(mapData?.services || []).slice(0, 5)}
                renderItem={item => (
                  <List.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong>{item.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.highway}</Text>
                      </div>
                      <Space direction="vertical" size={0} align="end">
                        <Badge status="success" text={`空位 ${item.parking_available}`} />
                        <Text type="secondary" style={{ fontSize: 12 }}>⭐ {item.rating}</Text>
                      </Space>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default TravelMap;
