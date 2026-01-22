/**
 * 省级一张网出行服务子系统 - 交旅融合资源推荐
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, List, Tag, Space, Button, Modal, Typography, Rate, Descriptions, Steps, Divider } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, CarOutlined, StarOutlined, RightOutlined } from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { travelApi } from '../../services/api';

const { Text, Title, Paragraph } = Typography;
const { Step } = Steps;

const TravelRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [themeFilter, setThemeFilter] = useState('all');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await travelApi.getRecommendations();
      setRecommendations(res.data?.list || generateMockRecommendations());
    } catch (error) {
      setRecommendations(generateMockRecommendations());
    }
    setLoading(false);
  };

  const generateMockRecommendations = () => {
    const themes = ['山水风光', '历史文化', '美食之旅', '温泉度假', '古镇探访', '海岛风情'];
    const cities = ['省会市', '东部市', '西部市', '南部市', '北部市'];
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      title: `${cities[i % cities.length]}${themes[i % themes.length]}游`,
      theme: themes[i % themes.length],
      description: '精选线路，带您领略沿途美景，体验当地特色文化',
      duration: `${1 + Math.floor(Math.random() * 4)}天${Math.floor(Math.random() * 2)}晚`,
      distance: `${100 + Math.floor(Math.random() * 400)}公里`,
      highlights: ['国家5A景区', '非遗体验', '特色美食', '精品民宿'].slice(0, 2 + Math.floor(Math.random() * 2)),
      rating: +(4 + Math.random()).toFixed(1),
      price: 500 + Math.floor(Math.random() * 2500),
    }));
  };

  const viewDetail = (route) => {
    setSelectedRoute({
      ...route,
      detail: {
        itinerary: [
          { day: 1, title: '启程', activities: ['集合出发', '途经服务区休息', '抵达第一站', '入住酒店'] },
          { day: 2, title: '深度游览', activities: ['早餐后出发', '游览主景点', '品尝当地美食', '返程或续住'] },
        ],
        included: ['高速通行费', '景点门票', '导游服务', '旅游保险'],
        excluded: ['个人消费', '餐饮自理部分', '住宿升级差价'],
        tips: ['建议提前3天预约', '请携带有效身份证件', '关注天气预报，备好防雨用具'],
        related_services: [
          { name: '沿途服务区', count: Math.floor(3 + Math.random() * 5) },
          { name: '加油站', count: Math.floor(5 + Math.random() * 10) },
          { name: '充电桩', count: Math.floor(10 + Math.random() * 20) },
        ]
      }
    });
    setDetailVisible(true);
  };

  const themes = ['全部', '山水风光', '历史文化', '美食之旅', '温泉度假', '古镇探访', '海岛风情'];
  const themeColors = {
    '山水风光': 'green',
    '历史文化': 'gold',
    '美食之旅': 'orange',
    '温泉度假': 'cyan',
    '古镇探访': 'purple',
    '海岛风情': 'blue',
  };

  const filteredRecommendations = themeFilter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.theme === themeFilter);

  return (
    <div>
      <PageHeader 
        title="交旅融合资源推荐" 
        subtitle="精选自驾游线路，一路畅行，一路风景"
        breadcrumb={['一张网出行服务', '交旅融合']}
      />

      {/* 主题筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          {themes.map(theme => (
            <Tag 
              key={theme}
              color={themeFilter === (theme === '全部' ? 'all' : theme) ? '#1890ff' : 'default'}
              style={{ cursor: 'pointer', padding: '4px 12px' }}
              onClick={() => setThemeFilter(theme === '全部' ? 'all' : theme)}
            >
              {theme}
            </Tag>
          ))}
        </Space>
      </Card>

      {/* 推荐列表 */}
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
        dataSource={filteredRecommendations}
        loading={loading}
        renderItem={route => (
          <List.Item>
            <Card
              hoverable
              cover={
                <div style={{ 
                  height: 150, 
                  background: `linear-gradient(135deg, ${themeColors[route.theme] || '#1890ff'}40, ${themeColors[route.theme] || '#1890ff'}20)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                }}>
                  🏞️
                </div>
              }
              actions={[
                <Button type="link" onClick={() => viewDetail(route)}>查看详情 <RightOutlined /></Button>
              ]}
            >
              <Card.Meta
                title={
                  <Space>
                    <Text strong>{route.title}</Text>
                  </Space>
                }
                description={
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <Tag color={themeColors[route.theme]}>{route.theme}</Tag>
                    </div>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8, color: '#8c8c8c', fontSize: 13 }}>
                      {route.description}
                    </Paragraph>
                    <Space split={<Divider type="vertical" />} wrap>
                      <span><ClockCircleOutlined /> {route.duration}</span>
                      <span><CarOutlined /> {route.distance}</span>
                    </Space>
                    <div style={{ marginTop: 8 }}>
                      <Rate disabled defaultValue={Math.round(route.rating)} style={{ fontSize: 12 }} />
                      <Text type="secondary" style={{ marginLeft: 8 }}>{route.rating}</Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Text type="danger" style={{ fontSize: 18, fontWeight: 600 }}>¥{route.price}</Text>
                      <Text type="secondary"> /人起</Text>
                    </div>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      {/* 详情弹窗 */}
      <Modal 
        title={<span><StarOutlined style={{ color: '#faad14' }} /> 路线详情</span>} 
        open={detailVisible} 
        onCancel={() => setDetailVisible(false)} 
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
          <Button key="book" type="primary">立即预约</Button>,
        ]}
        width={800}
      >
        {selectedRoute && (
          <>
            <Row gutter={16}>
              <Col span={16}>
                <Title level={4}>{selectedRoute.title}</Title>
                <Space split={<Divider type="vertical" />}>
                  <Tag color={themeColors[selectedRoute.theme]}>{selectedRoute.theme}</Tag>
                  <span><ClockCircleOutlined /> {selectedRoute.duration}</span>
                  <span><CarOutlined /> {selectedRoute.distance}</span>
                  <span><Rate disabled defaultValue={Math.round(selectedRoute.rating)} style={{ fontSize: 12 }} /> {selectedRoute.rating}</span>
                </Space>
                <Paragraph style={{ marginTop: 16 }}>{selectedRoute.description}</Paragraph>
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Text type="danger" style={{ fontSize: 28, fontWeight: 600 }}>¥{selectedRoute.price}</Text>
                <Text type="secondary"> /人起</Text>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>行程亮点</Title>
            <Space wrap>
              {selectedRoute.highlights.map((h, i) => <Tag key={i} color="blue">{h}</Tag>)}
            </Space>

            <Title level={5} style={{ marginTop: 24 }}>行程安排</Title>
            <Steps direction="vertical" size="small">
              {selectedRoute.detail?.itinerary.map(day => (
                <Step 
                  key={day.day}
                  title={`第${day.day}天 - ${day.title}`}
                  description={
                    <List
                      size="small"
                      dataSource={day.activities}
                      renderItem={item => <List.Item style={{ padding: '4px 0' }}>• {item}</List.Item>}
                    />
                  }
                />
              ))}
            </Steps>

            <Row gutter={16} style={{ marginTop: 24 }}>
              <Col span={12}>
                <Title level={5}>费用包含</Title>
                <List
                  size="small"
                  dataSource={selectedRoute.detail?.included || []}
                  renderItem={item => <List.Item style={{ padding: '4px 0' }}>✓ {item}</List.Item>}
                />
              </Col>
              <Col span={12}>
                <Title level={5}>费用不含</Title>
                <List
                  size="small"
                  dataSource={selectedRoute.detail?.excluded || []}
                  renderItem={item => <List.Item style={{ padding: '4px 0' }}>✗ {item}</List.Item>}
                />
              </Col>
            </Row>

            <Title level={5} style={{ marginTop: 24 }}>沿途服务</Title>
            <Row gutter={16}>
              {selectedRoute.detail?.related_services?.map((s, i) => (
                <Col span={8} key={i}>
                  <Card size="small">
                    <Text type="secondary">{s.name}</Text>
                    <div><Text strong style={{ fontSize: 20 }}>{s.count}</Text> 个</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
};

export default TravelRecommendations;
