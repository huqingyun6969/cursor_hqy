/**
 * 省级交通运行预警预测子系统 - 预警规则配置
 * 支持多场景预警规则的查看、创建、编辑
 */
import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Tag, Space, Button, Modal, Form, Input, InputNumber, 
  Select, Switch, message, Popconfirm, Typography, Descriptions, Row, Col 
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { trafficApi } from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const WarningRules = () => {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form] = Form.useForm();

  // 加载数据
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await trafficApi.getWarningRules();
      setRules(res.data || generateMockRules());
    } catch (error) {
      setRules(generateMockRules());
    }
    setLoading(false);
  };

  // 生成模拟数据
  const generateMockRules = () => [
    { id: 1, name: '拥堵预警', type: 'congestion', threshold: 1.5, level: '黄色预警', enabled: true, description: '拥堵指数超过1.5时触发黄色预警' },
    { id: 2, name: '严重拥堵预警', type: 'congestion', threshold: 2.0, level: '红色预警', enabled: true, description: '拥堵指数超过2.0时触发红色预警' },
    { id: 3, name: '高流量预警', type: 'flow', threshold: 8000, level: '黄色预警', enabled: true, description: '小时车流量超过8000辆时触发预警' },
    { id: 4, name: '低速预警', type: 'speed', threshold: 30, level: '橙色预警', enabled: true, description: '路段平均车速低于30km/h时触发预警' },
    { id: 5, name: '事故预警', type: 'accident', threshold: 1, level: '红色预警', enabled: true, description: '发生交通事故时自动触发红色预警' },
    { id: 6, name: '气象预警', type: 'weather', threshold: 3, level: '橙色预警', enabled: false, description: '恶劣天气等级达到3级时触发预警' },
  ];

  // 规则类型配置
  const ruleTypes = [
    { value: 'congestion', label: '拥堵预警', unit: '指数' },
    { value: 'flow', label: '流量预警', unit: '辆/h' },
    { value: 'speed', label: '速度预警', unit: 'km/h' },
    { value: 'accident', label: '事故预警', unit: '次' },
    { value: 'weather', label: '气象预警', unit: '级' },
  ];

  // 预警级别配置
  const warningLevels = [
    { value: '蓝色预警', color: 'blue' },
    { value: '黄色预警', color: 'gold' },
    { value: '橙色预警', color: 'orange' },
    { value: '红色预警', color: 'red' },
  ];

  // 打开创建/编辑弹窗
  const openModal = (rule = null) => {
    setEditingRule(rule);
    if (rule) {
      form.setFieldsValue(rule);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRule) {
        // 更新规则
        const updated = rules.map(r => r.id === editingRule.id ? { ...r, ...values } : r);
        setRules(updated);
        message.success('规则更新成功');
      } else {
        // 创建规则
        const newRule = { id: Date.now(), ...values, enabled: true };
        setRules([...rules, newRule]);
        message.success('规则创建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 切换启用状态
  const toggleEnabled = (id, enabled) => {
    const updated = rules.map(r => r.id === id ? { ...r, enabled } : r);
    setRules(updated);
    message.success(enabled ? '规则已启用' : '规则已禁用');
  };

  // 删除规则
  const deleteRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
    message.success('规则已删除');
  };

  // 表格列定义
  const columns = [
    { 
      title: '规则名称', 
      dataIndex: 'name', 
      key: 'name',
      render: (text, record) => (
        <Space>
          <SettingOutlined />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (type) => {
        const config = ruleTypes.find(t => t.value === type);
        return <Tag>{config?.label || type}</Tag>;
      }
    },
    { 
      title: '阈值', 
      dataIndex: 'threshold', 
      key: 'threshold',
      render: (threshold, record) => {
        const config = ruleTypes.find(t => t.value === record.type);
        return `${threshold} ${config?.unit || ''}`;
      }
    },
    { 
      title: '预警级别', 
      dataIndex: 'level', 
      key: 'level',
      render: (level) => {
        const config = warningLevels.find(l => l.value === level);
        return <Tag color={config?.color}>{level}</Tag>;
      }
    },
    { 
      title: '状态', 
      dataIndex: 'enabled', 
      key: 'enabled',
      render: (enabled, record) => (
        <Switch 
          checked={enabled} 
          onChange={(checked) => toggleEnabled(record.id, checked)}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
        />
      )
    },
    { 
      title: '描述', 
      dataIndex: 'description', 
      key: 'description',
      ellipsis: true,
      width: 250,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此规则?"
            onConfirm={() => deleteRule(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="预警规则配置" 
        subtitle="配置多场景预警规则，系统将根据规则自动触发预警"
        breadcrumb={['交通运行预警预测', '预警规则配置']}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新建规则
          </Button>
        }
      />

      {/* 规则统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Text type="secondary">规则总数</Text>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>
              {rules.length}
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Text type="secondary">已启用</Text>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>
              {rules.filter(r => r.enabled).length}
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Text type="secondary">已禁用</Text>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#8c8c8c' }}>
              {rules.filter(r => !r.enabled).length}
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Text type="secondary">红色预警规则</Text>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#f5222d' }}>
              {rules.filter(r => r.level === '红色预警').length}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 规则列表 */}
      <Card>
        <Table
          dataSource={rules}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={editingRule ? '编辑预警规则' : '新建预警规则'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="规则类型"
                rules={[{ required: true, message: '请选择规则类型' }]}
              >
                <Select placeholder="请选择规则类型">
                  {ruleTypes.map(t => (
                    <Option key={t.value} value={t.value}>{t.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="level"
                label="预警级别"
                rules={[{ required: true, message: '请选择预警级别' }]}
              >
                <Select placeholder="请选择预警级别">
                  {warningLevels.map(l => (
                    <Option key={l.value} value={l.value}>
                      <Tag color={l.color}>{l.value}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="threshold"
            label="触发阈值"
            rules={[{ required: true, message: '请输入触发阈值' }]}
          >
            <InputNumber 
              placeholder="请输入触发阈值" 
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="规则描述"
          >
            <TextArea rows={3} placeholder="请输入规则描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WarningRules;
