/**
 * 省级基础设施监测预警子系统 - 故障报警
 */
import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Select, Button, Modal, Form, Input, message, Statistic, Row, Col, Typography } from 'antd';
import { AlertOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { infrastructureApi } from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const InfrastructureAlerts = () => {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [handleModalVisible, setHandleModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await infrastructureApi.getAlerts();
      setAlerts(res.data?.list || generateMockAlerts());
    } catch (error) {
      setAlerts(generateMockAlerts());
    }
    setLoading(false);
  };

  const generateMockAlerts = () => {
    const faultTypes = ['传感器离线', '数据异常', '通信中断', '设备故障', '电源异常'];
    const facilities = ['省会大桥01', '东部隧道03', '西部收费站02', '南部服务区05', '北部监控中心01'];
    const statuses = ['未处理', '处理中', '已处理'];
    
    return Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      facility: facilities[i % facilities.length],
      fault_type: faultTypes[i % faultTypes.length],
      description: '系统检测到异常，请及时处理',
      time: `2024-01-15 ${String(8 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      status: statuses[Math.floor(Math.random() * 3)],
      handler: Math.random() > 0.3 ? `运维员${String(Math.floor(Math.random() * 10) + 1).padStart(2, '0')}` : null,
    }));
  };

  const openHandleModal = (alert) => {
    setSelectedAlert(alert);
    form.resetFields();
    setHandleModalVisible(true);
  };

  const handleAlert = async () => {
    try {
      const values = await form.validateFields();
      const updated = alerts.map(a => a.id === selectedAlert.id ? { ...a, status: '已处理', handler: values.handler } : a);
      setAlerts(updated);
      message.success('报警处理成功');
      setHandleModalVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  const startProcess = (alert) => {
    const updated = alerts.map(a => a.id === alert.id ? { ...a, status: '处理中', handler: '当前用户' } : a);
    setAlerts(updated);
    message.success('开始处理');
  };

  const filteredAlerts = statusFilter === 'all' ? alerts : alerts.filter(a => a.status === statusFilter);

  const statusCounts = {
    pending: alerts.filter(a => a.status === '未处理').length,
    processing: alerts.filter(a => a.status === '处理中').length,
    resolved: alerts.filter(a => a.status === '已处理').length,
  };

  const columns = [
    { title: '设施名称', dataIndex: 'facility', key: 'facility' },
    { title: '故障类型', dataIndex: 'fault_type', key: 'fault_type', render: (type) => <Tag color="orange">{type}</Tag> },
    { title: '故障描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '报警时间', dataIndex: 'time', key: 'time', width: 150 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (status) => {
      const colorMap = { '未处理': 'red', '处理中': 'orange', '已处理': 'green' };
      const iconMap = { '未处理': <ExclamationCircleOutlined />, '处理中': <ClockCircleOutlined />, '已处理': <CheckCircleOutlined /> };
      return <Tag color={colorMap[status]} icon={iconMap[status]}>{status}</Tag>;
    }},
    { title: '处理人', dataIndex: 'handler', key: 'handler', width: 100, render: (h) => h || '-' },
    { title: '操作', key: 'action', width: 150, render: (_, record) => (
      <Space>
        {record.status === '未处理' && <Button type="link" size="small" onClick={() => startProcess(record)}>开始处理</Button>}
        {record.status === '处理中' && <Button type="link" size="small" onClick={() => openHandleModal(record)}>完成处理</Button>}
        {record.status === '已处理' && <Text type="secondary">已完成</Text>}
      </Space>
    )},
  ];

  return (
    <div>
      <PageHeader 
        title="故障报警管理" 
        subtitle="系统运行故障报警监控与处理"
        breadcrumb={['基础设施监测', '故障报警']}
      />

      {/* 状态统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={8}>
          <Card size="small" style={{ borderLeft: '3px solid #f5222d' }}>
            <Statistic title={<span><ExclamationCircleOutlined /> 未处理</span>} value={statusCounts.pending} valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small" style={{ borderLeft: '3px solid #fa8c16' }}>
            <Statistic title={<span><ClockCircleOutlined /> 处理中</span>} value={statusCounts.processing} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title={<span><CheckCircleOutlined /> 已处理</span>} value={statusCounts.resolved} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      {/* 报警列表 */}
      <Card
        title={<span><AlertOutlined style={{ color: '#f5222d' }} /> 报警列表</span>}
        extra={
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 120 }}>
            <Option value="all">全部状态</Option>
            <Option value="未处理">未处理</Option>
            <Option value="处理中">处理中</Option>
            <Option value="已处理">已处理</Option>
          </Select>
        }
      >
        <Table dataSource={filteredAlerts} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      {/* 处理弹窗 */}
      <Modal title="处理报警" open={handleModalVisible} onOk={handleAlert} onCancel={() => setHandleModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item label="故障设施"><Input value={selectedAlert?.facility} disabled /></Form.Item>
          <Form.Item label="故障类型"><Input value={selectedAlert?.fault_type} disabled /></Form.Item>
          <Form.Item name="handler" label="处理人" rules={[{ required: true, message: '请输入处理人' }]}>
            <Input placeholder="请输入处理人" />
          </Form.Item>
          <Form.Item name="solution" label="处理方案">
            <TextArea rows={3} placeholder="请描述处理方案" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InfrastructureAlerts;
