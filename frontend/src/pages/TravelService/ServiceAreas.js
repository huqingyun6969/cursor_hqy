/**
 * 省级一张网出行服务子系统 - 服务区预约
 * 简洁专业风格设计
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, message, Descriptions, Progress, Table, Typography, Tooltip, Rate } from 'antd';
import { 
  ShopOutlined, 
  CarOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  StarFilled,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { travelApi } from '../../services/api';

const { Option } = Select;
const { Text, Title } = Typography;
const { Search } = Input;

const TravelServiceAreas = () => {
  const [loading, setLoading] = useState(false);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [reserveVisible, setReserveVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
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
    const highways = ['G1沪昆高速', 'G2京沪高速', 'G15沈海高速', 'S1省道', 'S26环城高速', 'G60沪昆高速'];
    const directions = ['上行', '下行'];
    const allServices = ['加油', '充电', '餐饮', '超市', '卫生间', '休息区', '汽修', '母婴室'];
    
    return names.map((name, i) => ({
      id: i + 1,
      name,
      highway: highways[i % highways.length],
      direction: directions[i % 2],
      services: allServices.slice(0, 4 + Math.floor(Math.random() * 4)),
      parking_total: Math.floor(150 + Math.random() * 150),
      parking_available: Math.floor(30 + Math.random() * 120),
      rating: +(3.5 + Math.random() * 1.5).toFixed(1),
      distance: (10 + Math.random() * 90).toFixed(0),
    }));
  };

  const viewDetail = (area) => {
    setSelectedArea({
      ...area,
      detail: {
        facilities: [
          { name: '加油站', status: '营业中', info: '92# 95# 98# 柴油' },
          { name: '充电桩', status: '可用', info: `${Math.floor(4 + Math.random() * 8)}个空闲` },
          { name: '餐饮区', status: '营业中', info: '06:00-22:00' },
          { name: '便利店', status: '营业中', info: '24小时' },
        ],
        parking_detail: {
          small: { total: Math.floor(100 + Math.random() * 100), available: Math.floor(30 + Math.random() * 70) },
          large: { total: Math.floor(50 + Math.random() * 50), available: Math.floor(10 + Math.random() * 40) },
        },
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
      await form.validateFields();
      message.success('预约成功');
      setReserveVisible(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
    }
  };

  // 过滤数据
  const filteredAreas = serviceAreas.filter(area => 
    !searchText || 
    area.name.includes(searchText) || 
    area.highway.includes(searchText)
  );

  // 停车位状态
  const getParkingStatus = (available, total) => {
    const ratio = available / total;
    if (ratio > 0.5) return { color: '#52c41a', text: '充足' };
    if (ratio > 0.2) return { color: '#faad14', text: '紧张' };
    return { color: '#ff4d4f', text: '紧张' };
  };

  // 统计
  const totalParking = serviceAreas.reduce((sum, a) => sum + a.parking_available, 0);

  return (
    <div>
      <PageHeader 
        title="服务区预约" 
        subtitle="查询服务区信息，预约停车位和服务设施"
        breadcrumb={['一张网出行服务', '服务区预约']}
      />

      {/* 顶部操作栏 */}
      <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: '16px 24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size={24}>
              <div>
                <Text type="secondary">服务区总数</Text>
                <Text strong style={{ fontSize: 20, marginLeft: 8 }}>{serviceAreas.length}</Text>
              </div>
              <div>
                <Text type="secondary">可用车位</Text>
                <Text strong style={{ fontSize: 20, marginLeft: 8, color: '#52c41a' }}>{totalParking}</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Search
                placeholder="搜索服务区/高速"
                allowClear
                onSearch={setSearchText}
                onChange={e => !e.target.value && setSearchText('')}
                style={{ width: 220 }}
              />
              <Button icon={<ReloadOutlined />} onClick={fetchServiceAreas}>刷新</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 服务区列表 */}
      <Row gutter={[16, 16]}>
        {filteredAreas.map((area) => {
          const parkingStatus = getParkingStatus(area.parking_available, area.parking_total);
          const parkingPercent = Math.round((area.parking_available / area.parking_total) * 100);
          
          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={area.id}>
              <Card
                hoverable
                size="small"
                onClick={() => viewDetail(area)}
                style={{ height: '100%' }}
                bodyStyle={{ padding: 16 }}
              >
                {/* 头部 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Title level={5} style={{ margin: 0, marginBottom: 4 }}>{area.name}</Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {area.highway} · {area.direction}
                      </Text>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      background: '#fffbe6',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}>
                      <StarFilled style={{ color: '#faad14', fontSize: 12, marginRight: 4 }} />
                      <Text strong style={{ fontSize: 13 }}>{area.rating}</Text>
                    </div>
                  </div>
                </div>

                {/* 服务标签 */}
                <div style={{ marginBottom: 12 }}>
                  <Space size={[4, 4]} wrap>
                    {area.services.slice(0, 5).map((service, idx) => (
                      <Tag key={idx} style={{ margin: 0, fontSize: 12 }}>{service}</Tag>
                    ))}
                    {area.services.length > 5 && (
                      <Tag style={{ margin: 0, fontSize: 12 }}>+{area.services.length - 5}</Tag>
                    )}
                  </Space>
                </div>

                {/* 停车位 */}
                <div style={{ 
                  background: '#fafafa', 
                  padding: '10px 12px', 
                  borderRadius: 6,
                  marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 13 }}>
                      <CarOutlined style={{ marginRight: 6 }} />停车位
                    </Text>
                    <Tag color={parkingStatus.color} style={{ margin: 0, fontSize: 12 }}>
                      {parkingStatus.text}
                    </Tag>
                  </div>
                  <Progress 
                    percent={parkingPercent} 
                    strokeColor={parkingStatus.color}
                    showInfo={false}
                    size="small"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>空位</Text>
                    <Text strong style={{ fontSize: 13, color: parkingStatus.color }}>
                      {area.parking_available} / {area.parking_total}
                    </Text>
                  </div>
                </div>

                {/* 操作按钮 */}
                <Row gutter={8}>
                  <Col span={12}>
                    <Button 
                      block 
                      size="small"
                      onClick={(e) => { e.stopPropagation(); viewDetail(area); }}
                    >
                      详情
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button 
                      type="primary" 
                      block 
                      size="small"
                      onClick={(e) => openReserveModal(area, e)}
                    >
                      预约
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 详情弹窗 */}
      <Modal
        title={selectedArea?.name}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
          <Button key="reserve" type="primary" onClick={() => { openReserveModal(selectedArea); setDetailVisible(false); }}>
            立即预约
          </Button>,
        ]}
        width={600}
      >
        {selectedArea && (
          <>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="所属高速">{selectedArea.highway}</Descriptions.Item>
              <Descriptions.Item label="方向">{selectedArea.direction}</Descriptions.Item>
              <Descriptions.Item label="服务评分">
                <Rate disabled defaultValue={Math.round(selectedArea.rating)} style={{ fontSize: 14 }} />
                <Text style={{ marginLeft: 8 }}>{selectedArea.rating}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedArea.detail?.contact}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginBottom: 12 }}>服务设施</Title>
            <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
              {selectedArea.detail?.facilities?.map((item, idx) => (
                <Col span={12} key={idx}>
                  <div style={{ 
                    background: '#fafafa', 
                    padding: '8px 12px', 
                    borderRadius: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <Text strong>{item.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.info}</Text>
                    </div>
                    <Tag color={item.status === '营业中' || item.status === '可用' ? 'green' : 'default'}>
                      {item.status}
                    </Tag>
                  </div>
                </Col>
              ))}
            </Row>

            <Title level={5} style={{ marginBottom: 12 }}>停车位</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Text type="secondary">小车位</Text>
                  <div>
                    <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                      {selectedArea.detail?.parking_detail?.small?.available}
                    </Text>
                    <Text type="secondary"> / {selectedArea.detail?.parking_detail?.small?.total}</Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Text type="secondary">大车位</Text>
                  <div>
                    <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                      {selectedArea.detail?.parking_detail?.large?.available}
                    </Text>
                    <Text type="secondary"> / {selectedArea.detail?.parking_detail?.large?.total}</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Modal>

      {/* 预约弹窗 */}
      <Modal 
        title="服务区预约"
        open={reserveVisible} 
        onOk={handleReserve} 
        onCancel={() => setReserveVisible(false)}
        okText="确认预约"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="服务区">
            <Input value={selectedArea?.name} disabled />
          </Form.Item>
          <Form.Item name="type" label="预约类型" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="请选择">
              <Option value="parking">停车位预约</Option>
              <Option value="charging">充电桩预约</Option>
              <Option value="green">绿通预约</Option>
            </Select>
          </Form.Item>
          <Form.Item name="vehicle_no" label="车牌号" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入车牌号" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="time" label="预约时间" rules={[{ required: true, message: '请选择' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TravelServiceAreas;
