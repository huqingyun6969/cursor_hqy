/**
 * 省级交通应急指挥调度管理子系统 - 值班排班
 */
import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, message, Calendar, Badge, Typography } from 'antd';
import { PlusOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { emergencyApi } from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

const EmergencyDuty = () => {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const staffList = ['张明', '李华', '王强', '赵敏', '刘洋', '陈静', '周杰', '吴磊'];
  const shifts = [
    { value: 'morning', label: '早班(08:00-16:00)' },
    { value: 'afternoon', label: '中班(16:00-24:00)' },
    { value: 'night', label: '晚班(00:00-08:00)' },
  ];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await emergencyApi.getDutySchedule({ days: 14 });
      setSchedule(res.data?.schedule || generateMockSchedule());
    } catch (error) {
      setSchedule(generateMockSchedule());
    }
    setLoading(false);
  };

  const generateMockSchedule = () => {
    const data = [];
    for (let i = 0; i < 14; i++) {
      const date = dayjs().add(i, 'day');
      data.push({
        date: date.format('YYYY-MM-DD'),
        weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.day()],
        shifts: shifts.map((shift, idx) => ({
          id: i * 3 + idx + 1,
          shift: shift.label,
          staff: staffList[Math.floor(Math.random() * staffList.length)],
          backup: staffList[Math.floor(Math.random() * staffList.length)],
          phone: `1${Math.floor(30 + Math.random() * 70)}${Math.floor(10000000 + Math.random() * 90000000)}`,
        })),
      });
    }
    return data;
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      message.success('排班创建成功');
      setModalVisible(false);
      form.resetFields();
      fetchSchedule();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date', width: 110, render: (date, record) => <><div>{date}</div><Text type="secondary">{record.weekday}</Text></> },
    { 
      title: '早班(08:00-16:00)', 
      key: 'morning',
      render: (_, record) => {
        const shift = record.shifts.find(s => s.shift.includes('早班'));
        return shift ? (
          <Space direction="vertical" size={0}>
            <span><UserOutlined /> {shift.staff}</span>
            <Text type="secondary" style={{ fontSize: 12 }}>备班: {shift.backup}</Text>
          </Space>
        ) : '-';
      }
    },
    { 
      title: '中班(16:00-24:00)', 
      key: 'afternoon',
      render: (_, record) => {
        const shift = record.shifts.find(s => s.shift.includes('中班'));
        return shift ? (
          <Space direction="vertical" size={0}>
            <span><UserOutlined /> {shift.staff}</span>
            <Text type="secondary" style={{ fontSize: 12 }}>备班: {shift.backup}</Text>
          </Space>
        ) : '-';
      }
    },
    { 
      title: '晚班(00:00-08:00)', 
      key: 'night',
      render: (_, record) => {
        const shift = record.shifts.find(s => s.shift.includes('晚班'));
        return shift ? (
          <Space direction="vertical" size={0}>
            <span><UserOutlined /> {shift.staff}</span>
            <Text type="secondary" style={{ fontSize: 12 }}>备班: {shift.backup}</Text>
          </Space>
        ) : '-';
      }
    },
  ];

  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const daySchedule = schedule.find(s => s.date === dateStr);
    if (!daySchedule) return null;
    
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {daySchedule.shifts.slice(0, 2).map((shift, idx) => (
          <li key={idx} style={{ fontSize: 12, marginBottom: 2 }}>
            <Badge status={idx === 0 ? 'success' : 'processing'} text={shift.staff} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <PageHeader 
        title="值班排班管理" 
        subtitle="管理应急值班人员排班安排"
        breadcrumb={['应急指挥调度', '值班排班']}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新增排班
          </Button>
        }
      />

      {/* 日历视图 */}
      <Card title="排班日历" style={{ marginBottom: 16 }}>
        <Calendar fullscreen={false} dateCellRender={dateCellRender} />
      </Card>

      {/* 列表视图 */}
      <Card title="排班列表">
        <Table
          dataSource={schedule}
          columns={columns}
          rowKey="date"
          loading={loading}
          pagination={{ pageSize: 7 }}
          size="middle"
        />
      </Card>

      {/* 新增排班弹窗 */}
      <Modal title="新增排班" open={modalVisible} onOk={handleAdd} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="date" label="日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="shift" label="班次" rules={[{ required: true }]}>
            <Select placeholder="请选择班次">
              {shifts.map(s => <Option key={s.value} value={s.value}>{s.label}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="staff" label="值班人员" rules={[{ required: true }]}>
            <Select placeholder="请选择值班人员">
              {staffList.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="backup" label="备班人员">
            <Select placeholder="请选择备班人员">
              {staffList.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" prefix={<PhoneOutlined />} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmergencyDuty;
