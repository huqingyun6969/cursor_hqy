/**
 * 省级一张网出行服务子系统 - 服务区预约
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, List, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, message, Descriptions, Rate, Typography, Badge } from 'antd';
import { ShopOutlined, CarOutlined, PhoneOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { travelApi } from '../../services/api';

const { Option } = Select;
const { Text, Title } = Typography;

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
    const highways = ['G1高速', 'G2高速', 'G15高速', 'S1省道'];
    const directions = ['上行', '下行'];
    
    return names.map((name, i) => ({
      id: i + 1,
      name,
      highway: highways[i % highways.length],
      direction: directions[i % 2],
      services: ['加油站', '餐饮', '超市', '卫生间', '休息区', '充电桩'].slice(0, 4 + Math.floor(Math.random() * 3)),
      parking_total: Math.floor(100 + Math.random() * 200),
      parking_available: Math.floor(20 + Math.random() * 130),
      rating: +(3.5 + Math.random() * 1.5).toFixed(1),
    }));
  };

  const viewDetail = (area) => {
    setSelectedArea({
      ...area,
      detail: {
        facilities: [
          { name: '加油站', status: '营业中', oil_types: ['92#', '95#', '98#', '柴油'] },
          { name: '餐饮区', status: '营业中', restaurants: ['快餐', '面食', '小吃'] },
          { name: '超市', status: '营业中', area: '200㎡' },
          { name: '充电桩', status: '可用', count: Math.floor(4 + Math.random() * 8), available: Math.floor(1 + Math.random() * 6) },
        ],
        parking_detail: {
          car: { total: Math.floor(100 + Math.random() * 100), available: Math.floor(30 + Math.random() * 70) },
          truck: { total: Math.floor(50 + Math.random() * 50), available: Math.floor(10 + Math.random() * 40) },
        },
        busy_hours: ['10:00-12:00', '17:00-19:00'],
        contact: `0571-${Math.floor(80000000 + Math.random() * 10000000)}`,
      }
    });
    setDetailVisible(true);
  };

  const openReserveModal = (area) => {
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

  return (
    <div>
      <PageHeader 
        title="服务区预约" 
        subtitle="查询服务区信息，预约停车位和服务"
        breadcrumb={['一张网出行服务', '服务区预约']}
      />

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
        dataSource={serviceAreas}
        loading={loading}
        renderItem={area => (
          <List.Item>
            <Card
              hoverable
              actions={[
                <Button type="link" onClick={() => viewDetail(area)}>查看详情</Button>,
                <Button type="link" onClick={() => openReserveModal(area)}>立即预约</Button>,
              ]}
            >
              <Card.Meta
                avatar={<ShopOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
                title={
                  <Space>
                    <Text strong>{area.name}</Text>
                    <Rate disabled defaultValue={Math.round(area.rating)} style={{ fontSize: 12 }} />
                  </Space>
                }
                description={
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <EnvironmentOutlined /> {area.highway} {area.direction}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      {area.services.map(s => <Tag key={s} color="blue" style={{ marginBottom: 4 }}>{s}</Tag>)}
                    </div>
                    <div>
                      <Badge status={area.parking_available > 50 ? 'success' : area.parking_available > 20 ? 'warning' : 'error'} />
                      <Text type="secondary">空位: {area.parking_available}/{area.parking_total}</Text>
                    </div>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      {/* 详情弹窗 */}
      <Modal title={<span><ShopOutlined /> 服务区详情</span>} open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={700}>
        {selectedArea && (
          <>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="服务区名称">{selectedArea.name}</Descriptions.Item>
              <Descriptions.Item label="所属高速">{selectedArea.highway} {selectedArea.direction}</Descriptions.Item>
              <Descriptions.Item label="评分"><Rate disabled defaultValue={Math.round(selectedArea.rating)} /> {selectedArea.rating}</Descriptions.Item>
              <Descriptions.Item label="联系电话"><PhoneOutlined /> {selectedArea.detail?.contact}</Descriptions.Item>
              <Descriptions.Item label="繁忙时段" span={2}>
                <ClockCircleOutlined /> {selectedArea.detail?.busy_hours?.join('、')}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 16 }}>设施服务</Title>
            <List
              size="small"
              dataSource={selectedArea.detail?.facilities || []}
              renderItem={item => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text strong>{item.name}</Text>
                    <Tag color={item.status === '营业中' || item.status === '可用' ? 'green' : 'red'}>{item.status}</Tag>
                  </Space>
                </List.Item>
              )}
            />

            <Title level={5} style={{ marginTop: 16 }}>停车位</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Text type="secondary">小车位</Text>
                  <div><Text strong style={{ fontSize: 20 }}>{selectedArea.detail?.parking_detail?.car?.available}</Text> / {selectedArea.detail?.parking_detail?.car?.total}</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Text type="secondary">货车位</Text>
                  <div><Text strong style={{ fontSize: 20 }}>{selectedArea.detail?.parking_detail?.truck?.available}</Text> / {selectedArea.detail?.parking_detail?.truck?.total}</div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Modal>

      {/* 预约弹窗 */}
      <Modal title="预约服务" open={reserveVisible} onOk={handleReserve} onCancel={() => setReserveVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item label="服务区"><Input value={selectedArea?.name} disabled /></Form.Item>
          <Form.Item name="type" label="预约类型" rules={[{ required: true }]}>
            <Select placeholder="请选择">
              <Option value="parking">停车位预约</Option>
              <Option value="charging">充电桩预约</Option>
              <Option value="green_pass">绿通预约</Option>
            </Select>
          </Form.Item>
          <Form.Item name="vehicle_no" label="车牌号" rules={[{ required: true }]}>
            <Input placeholder="请输入车牌号" prefix={<CarOutlined />} />
          </Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
            <Input placeholder="请输入联系电话" prefix={<PhoneOutlined />} />
          </Form.Item>
          <Form.Item name="time" label="预约时间" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TravelServiceAreas;
