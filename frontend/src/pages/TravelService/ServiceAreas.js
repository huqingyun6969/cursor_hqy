/**
 * 省级一张网出行服务子系统 - 服务区预约
 * 重新设计：美观、简洁、大气、上档次
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, message, Descriptions, Rate, Typography, Progress, Divider, Empty } from 'antd';
import { 
  ShopOutlined, 
  CarOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  ThunderboltOutlined,
  CoffeeOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  RightOutlined,
  StarFilled,
  CarFilled,
} from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { travelApi } from '../../services/api';

const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

const TravelServiceAreas = () => {
  const [loading, setLoading] = useState(false);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [reserveVisible, setReserveVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchServiceAreas();
  }, []);

  const fetchServiceAreas = async () => {
    setLoading(true);
    try {
      const res = await travelApi.getServiceAreas();
      setServiceAreas(res.data?.list || generateMockServiceAreas());
    } catch (error) {
      setServiceAreas(generateMockServiceAreas());
    }
    setLoading(false);
  };

  const generateMockServiceAreas = () => {
    const names = ['东阳服务区', '西湖服务区', '南山服务区', '北岭服务区', '青山服务区', '绿水服务区', '阳光服务区', '月亮湾服务区'];
    const highways = ['G1高速', 'G2高速', 'G15高速', 'S1省道', 'S26环城高速', 'G60沪昆高速'];
    const directions = ['上行', '下行'];
    const allServices = ['加油站', '充电桩', '餐饮', '超市', '卫生间', '休息区', '修车服务', '母婴室'];
    
    return names.map((name, i) => ({
      id: i + 1,
      name,
      highway: highways[i % highways.length],
      direction: directions[i % 2],
      services: allServices.slice(0, 4 + Math.floor(Math.random() * 4)),
      parking_total: Math.floor(150 + Math.random() * 150),
      parking_available: Math.floor(30 + Math.random() * 120),
      rating: +(4 + Math.random()).toFixed(1),
      distance: (10 + Math.random() * 90).toFixed(0),
      image_index: i % 4,
    }));
  };

  const viewDetail = (area) => {
    setSelectedArea({
      ...area,
      detail: {
        facilities: [
          { name: '加油站', status: '营业中', icon: '⛽', info: '92# 95# 98# 柴油' },
          { name: '充电桩', status: '可用', icon: '🔌', info: `${Math.floor(2 + Math.random() * 6)}个空闲` },
          { name: '餐饮区', status: '营业中', icon: '🍜', info: '快餐 面食 小吃' },
          { name: '便利店', status: '营业中', icon: '🏪', info: '24小时营业' },
          { name: '卫生间', status: '正常', icon: '🚻', info: '无障碍设施' },
          { name: '休息区', status: '开放', icon: '🛋️', info: '免费WiFi' },
        ],
        parking_detail: {
          car: { total: Math.floor(100 + Math.random() * 100), available: Math.floor(30 + Math.random() * 70) },
          truck: { total: Math.floor(50 + Math.random() * 50), available: Math.floor(10 + Math.random() * 40) },
          bus: { total: Math.floor(10 + Math.random() * 20), available: Math.floor(5 + Math.random() * 15) },
        },
        busy_hours: ['10:00-12:00', '17:00-19:00'],
        contact: `0571-${Math.floor(80000000 + Math.random() * 10000000)}`,
      }
    });
    setDetailVisible(true);
  };

  const openReserveModal = (area, e) => {
    e?.stopPropagation();
    setSelectedArea(area);
    form.resetFields();
    setReserveVisible(true);
  };

  const handleReserve = async () => {
    try {
      const values = await form.validateFields();
      message.success(`预约成功！服务区：${selectedArea.name}`);
      setReserveVisible(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
    }
  };

  // 服务图标映射
  const serviceIcons = {
    '加油站': '⛽',
    '充电桩': '🔌',
    '餐饮': '🍜',
    '超市': '🏪',
    '卫生间': '🚻',
    '休息区': '🛋️',
    '修车服务': '🔧',
    '母婴室': '👶',
  };

  // 计算停车位状态
  const getParkingStatus = (available, total) => {
    const ratio = available / total;
    if (ratio > 0.5) return { color: '#52c41a', text: '充足' };
    if (ratio > 0.2) return { color: '#faad14', text: '紧张' };
    return { color: '#f5222d', text: '拥挤' };
  };

  // 统计数据
  const totalAreas = serviceAreas.length;
  const totalParking = serviceAreas.reduce((sum, a) => sum + a.parking_available, 0);
  const avgRating = (serviceAreas.reduce((sum, a) => sum + a.rating, 0) / totalAreas).toFixed(1);

  return (
    <div>
      <PageHeader 
        title="服务区预约" 
        subtitle="查询服务区信息，预约停车位和服务设施"
        breadcrumb={['一张网出行服务', '服务区预约']}
      />

      {/* 顶部统计区域 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        padding: '32px 40px',
        marginBottom: 24,
        color: '#fff',
      }}>
        <Row gutter={[40, 24]} align="middle">
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <ShopOutlined style={{ fontSize: 40, opacity: 0.9, marginBottom: 12 }} />
              <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>{totalAreas}</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>服务区总数</div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <CarOutlined style={{ fontSize: 40, opacity: 0.9, marginBottom: 12 }} />
              <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>{totalParking}</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>可用停车位</div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <StarFilled style={{ fontSize: 40, opacity: 0.9, marginBottom: 12 }} />
              <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>{avgRating}</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>平均评分</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 服务区列表 */}
      <Row gutter={[20, 20]}>
        {serviceAreas.map((area) => {
          const parkingStatus = getParkingStatus(area.parking_available, area.parking_total);
          const parkingPercent = Math.round((area.parking_available / area.parking_total) * 100);
          
          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={area.id}>
              <Card
                hoverable
                onClick={() => viewDetail(area)}
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  height: '100%',
                }}
                bodyStyle={{ padding: 0 }}
                className="service-area-card"
              >
                {/* 顶部渐变背景 */}
                <div style={{
                  background: `linear-gradient(135deg, ${
                    area.image_index === 0 ? '#43e97b, #38f9d7' :
                    area.image_index === 1 ? '#fa709a, #fee140' :
                    area.image_index === 2 ? '#4facfe, #00f2fe' :
                    '#667eea, #764ba2'
                  })`,
                  padding: '24px 20px 20px',
                  position: 'relative',
                }}>
                  {/* 评分 */}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(255,255,255,0.95)',
                    padding: '4px 10px',
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <StarFilled style={{ color: '#faad14', fontSize: 14 }} />
                    <Text strong style={{ fontSize: 14 }}>{area.rating}</Text>
                  </div>
                  
                  {/* 服务区名称 */}
                  <Title level={4} style={{ color: '#fff', margin: 0, marginBottom: 8 }}>
                    {area.name}
                  </Title>
                  <Space style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <EnvironmentOutlined />
                    <span>{area.highway} · {area.direction}</span>
                  </Space>
                </div>

                {/* 内容区 */}
                <div style={{ padding: '20px' }}>
                  {/* 服务设施标签 */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 8,
                    }}>
                      {area.services.slice(0, 5).map((service, idx) => (
                        <span key={idx} style={{
                          background: '#f5f5f5',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          color: '#666',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          <span>{serviceIcons[service] || '📍'}</span>
                          {service}
                        </span>
                      ))}
                      {area.services.length > 5 && (
                        <span style={{
                          background: '#e6f7ff',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          color: '#1890ff',
                        }}>
                          +{area.services.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 停车位信息 */}
                  <div style={{
                    background: '#fafafa',
                    borderRadius: 10,
                    padding: '14px 16px',
                    marginBottom: 16,
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 10,
                    }}>
                      <Space>
                        <CarFilled style={{ color: '#1890ff' }} />
                        <Text strong>停车位</Text>
                      </Space>
                      <Tag 
                        color={parkingStatus.color} 
                        style={{ margin: 0, borderRadius: 4 }}
                      >
                        {parkingStatus.text}
                      </Tag>
                    </div>
                    <Progress 
                      percent={parkingPercent} 
                      strokeColor={parkingStatus.color}
                      trailColor="#e8e8e8"
                      showInfo={false}
                      size="small"
                    />
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginTop: 8,
                      fontSize: 13,
                    }}>
                      <Text type="secondary">空位</Text>
                      <Text strong style={{ color: parkingStatus.color }}>
                        {area.parking_available} / {area.parking_total}
                      </Text>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button 
                      block
                      onClick={(e) => { e.stopPropagation(); viewDetail(area); }}
                      style={{
                        borderRadius: 8,
                        height: 40,
                      }}
                    >
                      查看详情
                    </Button>
                    <Button 
                      type="primary"
                      block
                      onClick={(e) => openReserveModal(area, e)}
                      style={{
                        borderRadius: 8,
                        height: 40,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                      }}
                    >
                      立即预约
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 详情弹窗 */}
      <Modal
        title={null}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
        bodyStyle={{ padding: 0 }}
      >
        {selectedArea && (
          <div>
            {/* 弹窗头部 */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '32px',
              color: '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Title level={3} style={{ color: '#fff', margin: 0, marginBottom: 8 }}>
                    {selectedArea.name}
                  </Title>
                  <Space>
                    <EnvironmentOutlined />
                    <span>{selectedArea.highway} · {selectedArea.direction}</span>
                  </Space>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '12px 20px',
                  borderRadius: 12,
                  textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StarFilled style={{ fontSize: 20 }} />
                    <span style={{ fontSize: 28, fontWeight: 700 }}>{selectedArea.rating}</span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>服务评分</div>
                </div>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div style={{ padding: 32 }}>
              {/* 设施服务 */}
              <Title level={5} style={{ marginBottom: 16 }}>
                <CoffeeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                设施服务
              </Title>
              <Row gutter={[12, 12]} style={{ marginBottom: 32 }}>
                {selectedArea.detail?.facilities?.map((item, index) => (
                  <Col span={8} key={index}>
                    <div style={{
                      background: '#f9f9f9',
                      padding: '16px',
                      borderRadius: 10,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                      <Text strong>{item.name}</Text>
                      <br />
                      <Tag 
                        color={item.status === '营业中' || item.status === '可用' || item.status === '正常' || item.status === '开放' ? 'green' : 'orange'}
                        style={{ marginTop: 6 }}
                      >
                        {item.status}
                      </Tag>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{item.info}</div>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* 停车位详情 */}
              <Title level={5} style={{ marginBottom: 16 }}>
                <CarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                停车位详情
              </Title>
              <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                {[
                  { type: '小车位', ...selectedArea.detail?.parking_detail?.car, icon: '🚗' },
                  { type: '货车位', ...selectedArea.detail?.parking_detail?.truck, icon: '🚛' },
                  { type: '大巴位', ...selectedArea.detail?.parking_detail?.bus, icon: '🚌' },
                ].map((item, index) => (
                  <Col span={8} key={index}>
                    <Card size="small" style={{ textAlign: 'center', borderRadius: 10 }}>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>{item.icon}</div>
                      <Text type="secondary">{item.type}</Text>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>
                        {item.available}
                        <span style={{ fontSize: 14, color: '#999', fontWeight: 400 }}> / {item.total}</span>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* 其他信息 */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <div style={{ 
                    background: '#fff7e6', 
                    padding: '12px 16px', 
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>繁忙时段</Text>
                      <div><Text strong>{selectedArea.detail?.busy_hours?.join('、')}</Text></div>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ 
                    background: '#e6f7ff', 
                    padding: '12px 16px', 
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <PhoneOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>服务电话</Text>
                      <div><Text strong>{selectedArea.detail?.contact}</Text></div>
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button size="large" onClick={() => setDetailVisible(false)}>
                  关闭
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() => { openReserveModal(selectedArea); setDetailVisible(false); }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  }}
                >
                  立即预约
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 预约弹窗 */}
      <Modal 
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>预约服务</span>
          </Space>
        }
        open={reserveVisible} 
        onOk={handleReserve} 
        onCancel={() => setReserveVisible(false)}
        okText="确认预约"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="服务区">
            <Input value={selectedArea?.name} disabled prefix={<ShopOutlined />} />
          </Form.Item>
          <Form.Item name="type" label="预约类型" rules={[{ required: true, message: '请选择预约类型' }]}>
            <Select placeholder="请选择预约类型">
              <Option value="parking">🚗 停车位预约</Option>
              <Option value="charging">🔌 充电桩预约</Option>
              <Option value="green_pass">🚛 绿通预约</Option>
            </Select>
          </Form.Item>
          <Form.Item name="vehicle_no" label="车牌号" rules={[{ required: true, message: '请输入车牌号' }]}>
            <Input placeholder="请输入车牌号" prefix={<CarOutlined />} />
          </Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
            <Input placeholder="请输入联系电话" prefix={<PhoneOutlined />} />
          </Form.Item>
          <Form.Item name="time" label="预约时间" rules={[{ required: true, message: '请选择预约时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择预约时间" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 自定义样式 */}
      <style>{`
        .service-area-card {
          transition: all 0.3s ease;
        }
        .service-area-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default TravelServiceAreas;
