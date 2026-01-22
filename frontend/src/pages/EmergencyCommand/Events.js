/**
 * 省级交通应急指挥调度管理子系统 - 事件处置
 * 事件上报/分级叫应/调度/复盘全流程
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Space, Button, Modal, Form, Input, Select, message, Timeline, Descriptions, Tabs } from 'antd';
import {
  PlusOutlined, SendOutlined, CheckCircleOutlined, FileSearchOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { EventLevelTag, StatusTag } from '../../components/StatusTag';
import { emergencyApi } from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const EmergencyEvents = () => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await emergencyApi.getEvents();
      setEvents(res.data?.list || generateMockEvents());
    } catch (error) {
      setEvents(generateMockEvents());
    }
    setLoading(false);
  };

  const generateMockEvents = () => {
    const types = ['交通事故', '车辆故障', '道路施工', '气象灾害', '危化品泄漏'];
    const levels = ['一般', '较大', '重大', '特大'];
    const statuses = ['待处理', '处理中', '已调度', '已完成', '已复盘'];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      event_no: `EV2024011${String(i + 1).padStart(4, '0')}`,
      type: types[i % types.length],
      level: levels[Math.floor(Math.random() * 4)],
      location: `G${Math.ceil(Math.random() * 5)}高速 K${Math.floor(100 + Math.random() * 200)}+${Math.floor(Math.random() * 999)}`,
      description: `发生${types[i % types.length]}，需要紧急处理`,
      report_time: `2024-01-15 ${String(8 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      status: statuses[Math.floor(Math.random() * 5)],
      handler: `调度员${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
    }));
  };

  const filteredEvents = statusFilter === 'all' ? events : events.filter(e => e.status === statusFilter);

  const handleReport = async () => {
    try {
      const values = await form.validateFields();
      const newEvent = {
        id: events.length + 1,
        event_no: `EV${Date.now()}`,
        ...values,
        status: '待处理',
        report_time: new Date().toLocaleString(),
        handler: null,
      };
      setEvents([newEvent, ...events]);
      message.success('事件上报成功');
      setReportModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDispatch = (event) => {
    const updated = events.map(e => e.id === event.id ? { ...e, status: '已调度' } : e);
    setEvents(updated);
    message.success('调度成功');
  };

  const handleComplete = (event) => {
    const updated = events.map(e => e.id === event.id ? { ...e, status: '已完成' } : e);
    setEvents(updated);
    message.success('处置完成');
  };

  const handleReview = (event) => {
    const updated = events.map(e => e.id === event.id ? { ...e, status: '已复盘' } : e);
    setEvents(updated);
    message.success('复盘完成');
  };

  const viewDetail = (event) => {
    setSelectedEvent({
      ...event,
      timeline: [
        { time: event.report_time, action: '事件上报', operator: '系统' },
        ...(event.status !== '待处理' ? [{ time: '10:35', action: '事件确认', operator: event.handler }] : []),
        ...(event.status === '已调度' || event.status === '已完成' || event.status === '已复盘' ? [{ time: '10:40', action: '资源调度', operator: event.handler }] : []),
        ...(event.status === '已完成' || event.status === '已复盘' ? [{ time: '11:30', action: '处置完成', operator: event.handler }] : []),
        ...(event.status === '已复盘' ? [{ time: '14:00', action: '事件复盘', operator: event.handler }] : []),
      ]
    });
    setDetailModalVisible(true);
  };

  const columns = [
    { title: '事件编号', dataIndex: 'event_no', key: 'event_no', width: 150 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    { title: '级别', dataIndex: 'level', key: 'level', width: 80, render: (level) => <EventLevelTag level={level} /> },
    { title: '位置', dataIndex: 'location', key: 'location', ellipsis: true },
    { title: '上报时间', dataIndex: 'report_time', key: 'report_time', width: 150 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (status) => <StatusTag status={status} /> },
    {
      title: '操作', key: 'action', width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => viewDetail(record)}>详情</Button>
          {record.status === '待处理' && <Button type="link" size="small" onClick={() => handleDispatch(record)}>调度</Button>}
          {record.status === '已调度' && <Button type="link" size="small" onClick={() => handleComplete(record)}>完成</Button>}
          {record.status === '已完成' && <Button type="link" size="small" onClick={() => handleReview(record)}>复盘</Button>}
        </Space>
      ),
    },
  ];

  const statusCounts = {
    pending: events.filter(e => e.status === '待处理').length,
    processing: events.filter(e => e.status === '处理中').length,
    dispatched: events.filter(e => e.status === '已调度').length,
    completed: events.filter(e => e.status === '已完成').length,
    reviewed: events.filter(e => e.status === '已复盘').length,
  };

  return (
    <div>
      <PageHeader 
        title="事件处置" 
        subtitle="事件上报、分级叫应、调度、复盘全流程管理"
        breadcrumb={['应急指挥调度', '事件处置']}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setReportModalVisible(true)}>
            上报事件
          </Button>
        }
      />

      {/* 状态统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={4}><Card size="small"><div style={{ textAlign: 'center' }}><div style={{ color: '#f5222d', fontSize: 24, fontWeight: 600 }}>{statusCounts.pending}</div><div>待处理</div></div></Card></Col>
        <Col xs={12} sm={8} md={4}><Card size="small"><div style={{ textAlign: 'center' }}><div style={{ color: '#fa8c16', fontSize: 24, fontWeight: 600 }}>{statusCounts.processing}</div><div>处理中</div></div></Card></Col>
        <Col xs={12} sm={8} md={4}><Card size="small"><div style={{ textAlign: 'center' }}><div style={{ color: '#1890ff', fontSize: 24, fontWeight: 600 }}>{statusCounts.dispatched}</div><div>已调度</div></div></Card></Col>
        <Col xs={12} sm={8} md={4}><Card size="small"><div style={{ textAlign: 'center' }}><div style={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}>{statusCounts.completed}</div><div>已完成</div></div></Card></Col>
        <Col xs={12} sm={8} md={4}><Card size="small"><div style={{ textAlign: 'center' }}><div style={{ color: '#722ed1', fontSize: 24, fontWeight: 600 }}>{statusCounts.reviewed}</div><div>已复盘</div></div></Card></Col>
        <Col xs={12} sm={8} md={4}><Card size="small"><div style={{ textAlign: 'center' }}><div style={{ color: '#001529', fontSize: 24, fontWeight: 600 }}>{events.length}</div><div>总计</div></div></Card></Col>
      </Row>

      {/* 事件列表 */}
      <Card
        extra={
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 120 }}>
            <Option value="all">全部状态</Option>
            <Option value="待处理">待处理</Option>
            <Option value="处理中">处理中</Option>
            <Option value="已调度">已调度</Option>
            <Option value="已完成">已完成</Option>
            <Option value="已复盘">已复盘</Option>
          </Select>
        }
      >
        <Table dataSource={filteredEvents} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      {/* 上报事件弹窗 */}
      <Modal title="上报事件" open={reportModalVisible} onOk={handleReport} onCancel={() => setReportModalVisible(false)} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="事件类型" rules={[{ required: true }]}>
                <Select placeholder="请选择">
                  <Option value="交通事故">交通事故</Option>
                  <Option value="车辆故障">车辆故障</Option>
                  <Option value="道路施工">道路施工</Option>
                  <Option value="气象灾害">气象灾害</Option>
                  <Option value="危化品泄漏">危化品泄漏</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="level" label="事件级别" rules={[{ required: true }]}>
                <Select placeholder="请选择">
                  <Option value="一般">一般</Option>
                  <Option value="较大">较大</Option>
                  <Option value="重大">重大</Option>
                  <Option value="特大">特大</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="location" label="事件位置" rules={[{ required: true }]}>
            <Input placeholder="例如：G1高速 K125+500" />
          </Form.Item>
          <Form.Item name="description" label="事件描述">
            <TextArea rows={3} placeholder="请描述事件详情" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 事件详情弹窗 */}
      <Modal title="事件详情" open={detailModalVisible} onCancel={() => setDetailModalVisible(false)} footer={null} width={700}>
        {selectedEvent && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="基本信息" key="info">
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="事件编号">{selectedEvent.event_no}</Descriptions.Item>
                <Descriptions.Item label="事件类型">{selectedEvent.type}</Descriptions.Item>
                <Descriptions.Item label="事件级别"><EventLevelTag level={selectedEvent.level} /></Descriptions.Item>
                <Descriptions.Item label="当前状态"><StatusTag status={selectedEvent.status} /></Descriptions.Item>
                <Descriptions.Item label="事件位置" span={2}>{selectedEvent.location}</Descriptions.Item>
                <Descriptions.Item label="上报时间">{selectedEvent.report_time}</Descriptions.Item>
                <Descriptions.Item label="处理人员">{selectedEvent.handler || '-'}</Descriptions.Item>
                <Descriptions.Item label="事件描述" span={2}>{selectedEvent.description}</Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="处置进度" key="timeline">
              <Timeline mode="left">
                {selectedEvent.timeline?.map((item, index) => (
                  <Timeline.Item key={index} label={item.time}>
                    <p><strong>{item.action}</strong></p>
                    <p style={{ color: '#8c8c8c' }}>操作人: {item.operator}</p>
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default EmergencyEvents;
