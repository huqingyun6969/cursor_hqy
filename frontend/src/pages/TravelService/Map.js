/**
 * 省级一张网出行服务子系统 - 出行地图
 * 重新设计：美观、简洁、大气、上档次
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Checkbox, Space, Tag, Typography, Badge, Statistic, Tabs, Tooltip } from 'antd';
import { 
  EnvironmentOutlined, 
  CloudOutlined, 
  CarOutlined, 
  ShopOutlined,
  CheckCircleFilled,
  WarningFilled,
  ThunderboltOutlined,
  EyeOutlined,
  StarFilled,
} from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import MapPlaceholder from '../../components/MapPlaceholder';
import { travelApi } from '../../services/api';

const { Text, Title } = Typography;

const TravelMap = () => {
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState(null);
  const [layers, setLayers] = useState(['road', 'weather', 'service']);
  const [activeTab, setActiveTab] = useState('road');

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
      road: ['G1高速', 'G2高速', 'G15高速', 'S1省道', 'G60沪昆高速', 'S26环城高速'][i % 6],
      section: `${['省会市', '东部市', '西部市', '南部市', '北部市', '临海市'][i % 6]}段`,
      condition: ['畅通', '畅通', '畅通', '缓行', '拥堵'][Math.floor(Math.random() * 5)],
      color: ['#52c41a', '#52c41a', '#52c41a', '#faad14', '#f5222d'][Math.floor(Math.random() * 5)],
      speed: Math.floor(40 + Math.random() * 80),
    })),
    weather: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      station: `${['省会市', '东部市', '西部市', '南部市', '北部市', '临海市', '工业市', '旅游市'][i]}`,
      weather: ['晴', '多云', '阴', '小雨', '晴', '多云', '晴', '阴'][i],
      weather_icon: ['☀️', '⛅', '☁️', '🌧️', '☀️', '⛅', '☀️', '☁️'][i],
      temperature: Math.floor(15 + Math.random() * 15),
      humidity: Math.floor(40 + Math.random() * 40),
    })),
    services: Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      name: ['东阳服务区', '西湖服务区', '南山服务区', '北岭服务区', '青山服务区', '绿水服务区'][i],
      highway: ['G1高速', 'G2高速', 'G15高速', 'S1省道', 'G60高速', 'S26高速'][i],
      parking_available: Math.floor(20 + Math.random() * 100),
      rating: (4 + Math.random()).toFixed(1),
    })),
  });

  // 统计数据
  const stats = {
    smoothRoads: mapData?.roads?.filter(r => r.condition === '畅通').length || 0,
    congestedRoads: mapData?.roads?.filter(r => r.condition === '拥堵' || r.condition === '缓行').length || 0,
    serviceAreas: mapData?.services?.length || 0,
    weatherStations: mapData?.weather?.length || 0,
  };

  // 路况颜色配置
  const conditionConfig = {
    '畅通': { color: '#52c41a', bg: '#f6ffed', icon: <CheckCircleFilled /> },
    '缓行': { color: '#faad14', bg: '#fffbe6', icon: <WarningFilled /> },
    '拥堵': { color: '#f5222d', bg: '#fff2f0', icon: <WarningFilled /> },
    '管制': { color: '#722ed1', bg: '#f9f0ff', icon: <ThunderboltOutlined /> },
  };

  // 图层选项
  const layerOptions = [
    { key: 'road', label: '路况', icon: <CarOutlined />, color: '#1890ff' },
    { key: 'weather', label: '气象', icon: <CloudOutlined />, color: '#faad14' },
    { key: 'service', label: '服务区', icon: <ShopOutlined />, color: '#52c41a' },
  ];

  return (
    <div>
      <PageHeader 
        title="出行地图查询" 
        subtitle="实时查询路况、气象、服务设施信息，智能规划出行路线"
        breadcrumb={['一张网出行服务', '出行地图']}
      />

      {/* 顶部统计区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card 
            size="small" 
            style={{ 
              borderRadius: 12, 
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
              }}>
                <CheckCircleFilled />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>畅通路段</Text>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#52c41a', lineHeight: 1.2 }}>
                  {stats.smoothRoads} <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>条</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card 
            size="small" 
            style={{ 
              borderRadius: 12, 
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
              }}>
                <WarningFilled />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>拥堵/缓行</Text>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#f5222d', lineHeight: 1.2 }}>
                  {stats.congestedRoads} <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>条</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card 
            size="small" 
            style={{ 
              borderRadius: 12, 
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
              }}>
                <ShopOutlined />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>服务区</Text>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#722ed1', lineHeight: 1.2 }}>
                  {stats.serviceAreas} <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>个</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card 
            size="small" 
            style={{ 
              borderRadius: 12, 
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
              }}>
                <CloudOutlined />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>气象站点</Text>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#faad14', lineHeight: 1.2 }}>
                  {stats.weatherStations} <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>个</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 主体区域 */}
      <Row gutter={[20, 20]}>
        {/* 左侧地图 */}
        <Col xs={24} lg={16}>
          <Card 
            style={{ 
              borderRadius: 12, 
              border: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
            bodyStyle={{ padding: 16 }}
          >
            {/* 图层切换 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: '1px solid #f0f0f0',
            }}>
              <Title level={5} style={{ margin: 0 }}>
                <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                出行地图
              </Title>
              <Space size={12}>
                {layerOptions.map(layer => (
                  <div
                    key={layer.key}
                    onClick={() => {
                      if (layers.includes(layer.key)) {
                        setLayers(layers.filter(l => l !== layer.key));
                      } else {
                        setLayers([...layers, layer.key]);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 20,
                      cursor: 'pointer',
                      background: layers.includes(layer.key) ? `${layer.color}15` : '#f5f5f5',
                      border: `1px solid ${layers.includes(layer.key) ? layer.color : '#e8e8e8'}`,
                      color: layers.includes(layer.key) ? layer.color : '#666',
                      transition: 'all 0.3s',
                    }}
                  >
                    {layer.icon}
                    <span style={{ fontSize: 13 }}>{layer.label}</span>
                  </div>
                ))}
              </Space>
            </div>
            
            {/* 地图区域 */}
            <MapPlaceholder 
              title="省级出行服务地图" 
              height={480}
              legendItems={[
                { color: '#52c41a', label: '畅通' },
                { color: '#faad14', label: '缓行' },
                { color: '#f5222d', label: '拥堵' },
                { color: '#1890ff', label: '服务区' },
              ]}
            />
          </Card>
        </Col>

        {/* 右侧信息面板 */}
        <Col xs={24} lg={8}>
          <Card 
            style={{ 
              borderRadius: 12, 
              border: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              height: '100%',
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              centered
              style={{ height: '100%' }}
              items={[
                {
                  key: 'road',
                  label: (
                    <span style={{ padding: '0 8px' }}>
                      <CarOutlined /> 路况
                    </span>
                  ),
                  children: (
                    <div style={{ padding: '0 16px 16px', maxHeight: 500, overflowY: 'auto' }}>
                      {(mapData?.roads || []).slice(0, 10).map((item, idx) => {
                        const config = conditionConfig[item.condition] || conditionConfig['畅通'];
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '14px 16px',
                              marginBottom: 10,
                              borderRadius: 10,
                              background: config.bg,
                              border: `1px solid ${config.color}20`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ color: config.color, fontSize: 16 }}>
                                {config.icon}
                              </div>
                              <div>
                                <Text strong style={{ fontSize: 14 }}>{item.road}</Text>
                                <div style={{ fontSize: 12, color: '#999' }}>{item.section}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <Tag 
                                color={config.color} 
                                style={{ 
                                  margin: 0, 
                                  borderRadius: 4,
                                  fontWeight: 500,
                                }}
                              >
                                {item.condition}
                              </Tag>
                              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                                {item.speed} km/h
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ),
                },
                {
                  key: 'weather',
                  label: (
                    <span style={{ padding: '0 8px' }}>
                      <CloudOutlined /> 气象
                    </span>
                  ),
                  children: (
                    <div style={{ padding: '0 16px 16px', maxHeight: 500, overflowY: 'auto' }}>
                      {(mapData?.weather || []).map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            marginBottom: 10,
                            borderRadius: 10,
                            background: '#fafafa',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 32 }}>{item.weather_icon}</div>
                            <div>
                              <Text strong style={{ fontSize: 14 }}>{item.station}</Text>
                              <div style={{ fontSize: 12, color: '#999' }}>{item.weather}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 22, fontWeight: 600, color: '#1890ff' }}>
                              {item.temperature}°
                            </div>
                            <div style={{ fontSize: 12, color: '#999' }}>
                              湿度 {item.humidity}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  key: 'service',
                  label: (
                    <span style={{ padding: '0 8px' }}>
                      <ShopOutlined /> 服务区
                    </span>
                  ),
                  children: (
                    <div style={{ padding: '0 16px 16px', maxHeight: 500, overflowY: 'auto' }}>
                      {(mapData?.services || []).map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '16px',
                            marginBottom: 10,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                            border: '1px solid #667eea30',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              <Text strong style={{ fontSize: 15 }}>{item.name}</Text>
                              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                                <EnvironmentOutlined style={{ marginRight: 4 }} />
                                {item.highway}
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 4,
                              background: '#fff',
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}>
                              <StarFilled style={{ color: '#faad14', fontSize: 12 }} />
                              <Text strong style={{ fontSize: 13 }}>{item.rating}</Text>
                            </div>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: '#fff',
                            borderRadius: 6,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <CarOutlined style={{ color: '#1890ff' }} />
                              <Text type="secondary" style={{ fontSize: 12 }}>空位</Text>
                            </div>
                            <Text strong style={{ color: item.parking_available > 50 ? '#52c41a' : '#faad14' }}>
                              {item.parking_available} 个
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TravelMap;
