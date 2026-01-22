/**
 * 省级一张网出行服务子系统 - 一键救援
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Input, Select, message, Steps, Table, Tag, Space, Typography, Result, Descriptions } from 'antd';
import { PhoneOutlined, CarOutlined, EnvironmentOutlined, AlertOutlined, CheckCircleOutlined, ClockCircleOutlined, LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { travelApi } from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Step } = Steps;

const TravelRescue = () => {
  const [loading, setLoading] = useState(false);
  const [rescueList, setRescueList] = useState([]);
  const [rescueModalVisible, setRescueModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [currentRescue, setCurrentRescue] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRescueList();
  }, []);

  const fetchRescueList = async () => {
    setLoading(true);
    try {
      const res = await travelApi.getRescueRequests();
      setRescueList(res.data?.list || generateMockRescueList());
    } catch (error) {
      setRescueList(generateMockRescueList());
    }
    setLoading(false);
  };

  const generateMockRescueList = () => {
    const types = ['车辆故障', '轮胎漏气', '燃油耗尽', '事故救援', '电瓶没电'];
    const statuses = ['待接单', '已派单', '救援中', '已完成'];
    
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      request_no: `SOS2024011${String(i + 1).padStart(4, '0')}`,
      type: types[i % types.length],
      location: `G${Math.ceil((i + 1) / 2)}高速 K${Math.floor(100 + Math.random() * 200)}+${Math.floor(Math.random() * 999)}`,
      user_name: `用户${1000 + i}`,
      phone: `1${Math.floor(30 + Math.random() * 70)}****${Math.floor(1000 + Math.random() * 9000)}`,
      vehicle_no: `浙${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(10000 + Math.random() * 90000)}`,
      status: statuses[Math.floor(Math.random() * 4)],
      create_time: `2024-01-15 ${String(8 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    }));
  };

  const handleRescue = async () => {
    try {
      const values = await form.validateFields();
      const newRescue = {
        id: rescueList.length + 1,
        request_no: `SOS${Date.now()}`,
        ...values,
        status: '待接单',
        create_time: new Date().toLocaleString(),
      };
      setCurrentRescue(newRescue);
      setRescueModalVisible(false);
      setResultModalVisible(true);
      setRescueList([newRescue, ...rescueList]);
      form.resetFields();
      
      // 模拟派单
      setTimeout(() => {
        setCurrentRescue(prev => ({ ...prev, status: '已派单', rescuer: '救援员008', eta: 15 }));
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const rescueTypes = [
    { value: '车辆故障', icon: '🔧' },
    { value: '轮胎漏气', icon: '⭕' },
    { value: '燃油耗尽', icon: '⛽' },
    { value: '电瓶没电', icon: '🔋' },
    { value: '事故救援', icon: '🚨' },
  ];

  const getStatusStep = (status) => {
    switch (status) {
      case '待接单': return 0;
      case '已派单': return 1;
      case '救援中': return 2;
      case '已完成': return 3;
      default: return 0;
    }
  };

  const columns = [
    { title: '请求编号', dataIndex: 'request_no', key: 'request_no', width: 150 },
    { title: '救援类型', dataIndex: 'type', key: 'type', width: 100, render: (type) => <Tag>{type}</Tag> },
    { title: '位置', dataIndex: 'location', key: 'location', ellipsis: true },
    { title: '车牌号', dataIndex: 'vehicle_no', key: 'vehicle_no', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (status) => {
      const colorMap = { '待接单': 'orange', '已派单': 'blue', '救援中': 'processing', '已完成': 'green' };
      return <Tag color={colorMap[status]}>{status}</Tag>;
    }},
    { title: '时间', dataIndex: 'create_time', key: 'create_time', width: 150 },
  ];

  return (
    <div>
      <PageHeader 
        title="一键救援" 
        subtitle="快速发起道路救援请求"
        breadcrumb={['一张网出行服务', '一键救援']}
      />

      {/* 一键救援入口 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #f5222d 0%, #cf1322 100%)',
              borderRadius: 12,
              textAlign: 'center',
              padding: 24,
            }}
          >
            <AlertOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 16 }} />
            <Title level={3} style={{ color: '#fff', margin: '8px 0' }}>一键救援</Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', display: 'block', marginBottom: 16 }}>
              遇到车辆故障？点击下方按钮快速呼叫救援
            </Text>
            <Button 
              size="large" 
              type="default"
              style={{ background: '#fff', color: '#f5222d', fontWeight: 600 }}
              onClick={() => setRescueModalVisible(true)}
            >
              <PhoneOutlined /> 立即呼叫救援
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card style={{ height: '100%' }}>
            <Title level={5}>救援类型</Title>
            <Row gutter={[8, 8]}>
              {rescueTypes.map(t => (
                <Col span={12} key={t.value}>
                  <Button 
                    block 
                    size="large"
                    style={{ height: 60, textAlign: 'left' }}
                    onClick={() => { form.setFieldValue('type', t.value); setRescueModalVisible(true); }}
                  >
                    <span style={{ fontSize: 20, marginRight: 8 }}>{t.icon}</span>
                    {t.value}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 救援记录 */}
      <Card title="我的救援记录">
        <Table dataSource={rescueList} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
      </Card>

      {/* 发起救援弹窗 */}
      <Modal title="发起救援" open={rescueModalVisible} onOk={handleRescue} onCancel={() => setRescueModalVisible(false)} okText="发起救援">
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="救援类型" rules={[{ required: true }]}>
            <Select placeholder="请选择救援类型">
              {rescueTypes.map(t => <Option key={t.value} value={t.value}>{t.icon} {t.value}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="location" label="当前位置" rules={[{ required: true }]}>
            <Input placeholder="例如：G1高速 K125+500" prefix={<EnvironmentOutlined />} />
          </Form.Item>
          <Form.Item name="vehicle_no" label="车牌号" rules={[{ required: true }]}>
            <Input placeholder="请输入车牌号" prefix={<CarOutlined />} />
          </Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
            <Input placeholder="请输入联系电话" prefix={<PhoneOutlined />} />
          </Form.Item>
          <Form.Item name="description" label="问题描述">
            <TextArea rows={3} placeholder="请描述您遇到的问题" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 救援进度弹窗 */}
      <Modal title="救援进度" open={resultModalVisible} onCancel={() => setResultModalVisible(false)} footer={null} width={600}>
        {currentRescue && (
          <>
            <Result
              icon={currentRescue.status === '待接单' ? <LoadingOutlined style={{ color: '#fa8c16' }} /> : <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              title={currentRescue.status === '待接单' ? '救援请求已提交' : '救援人员已派单'}
              subTitle={currentRescue.status === '待接单' ? '正在为您匹配最近的救援力量...' : `预计 ${currentRescue.eta || 15} 分钟到达`}
            />
            
            <Steps current={getStatusStep(currentRescue.status)} style={{ marginBottom: 24 }}>
              <Step title="已提交" icon={<ExclamationCircleOutlined />} />
              <Step title="已派单" icon={<CheckCircleOutlined />} />
              <Step title="救援中" icon={<LoadingOutlined />} />
              <Step title="已完成" icon={<CheckCircleOutlined />} />
            </Steps>

            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="请求编号">{currentRescue.request_no}</Descriptions.Item>
              <Descriptions.Item label="救援类型">{currentRescue.type}</Descriptions.Item>
              <Descriptions.Item label="位置">{currentRescue.location}</Descriptions.Item>
              {currentRescue.rescuer && (
                <Descriptions.Item label="救援人员">{currentRescue.rescuer}</Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}
      </Modal>
    </div>
  );
};

export default TravelRescue;
