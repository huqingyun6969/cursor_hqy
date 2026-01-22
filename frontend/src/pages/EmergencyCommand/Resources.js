/**
 * 省级交通应急指挥调度管理子系统 - 应急力量
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Space, Select, Button, Statistic, Descriptions, Modal } from 'antd';
import {
  CarOutlined, TeamOutlined, EnvironmentOutlined, PhoneOutlined, ReloadOutlined,
} from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import MapPlaceholder from '../../components/MapPlaceholder';
import { emergencyApi } from '../../services/api';

const { Option } = Select;

const EmergencyResources = () => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await emergencyApi.getResources();
      setResources(res.data?.list || generateMockResources());
    } catch (error) {
      setResources(generateMockResources());
    }
    setLoading(false);
  };

  const generateMockResources = () => {
    const types = ['救援车辆', '消防车', '救护车', '清障车', '巡逻车', '指挥车'];
    const statuses = ['待命', '执行中', '维护中'];
    const cities = ['省会市', '东部市', '西部市', '南部市', '北部市', '中部市'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `${types[i % types.length]}${String(i + 1).padStart(3, '0')}`,
      type: types[i % types.length],
      status: statuses[Math.floor(Math.random() * 3)],
      location: cities[i % cities.length],
      team: `第${Math.ceil((i + 1) / 10)}应急小队`,
      contact: `1${Math.floor(30 + Math.random() * 70)}${Math.floor(10000000 + Math.random() * 90000000)}`,
      coordinates: { lng: 119 + Math.random() * 3, lat: 29 + Math.random() * 2 }
    }));
  };

  const filteredResources = resources.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const resourceTypes = ['救援车辆', '消防车', '救护车', '清障车', '巡逻车', '指挥车'];

  const statusCounts = {
    total: resources.length,
    standby: resources.filter(r => r.status === '待命').length,
    dispatched: resources.filter(r => r.status === '执行中').length,
    maintenance: resources.filter(r => r.status === '维护中').length,
  };

  const columns = [
    { 
      title: '资源名称', dataIndex: 'name', key: 'name',
      render: (text, record) => (
        <a onClick={() => setSelectedResource(record)}>
          <CarOutlined style={{ marginRight: 4 }} />{text}
        </a>
      )
    },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    { 
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (status) => {
        const colorMap = { '待命': 'green', '执行中': 'blue', '维护中': 'orange' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    { title: '所在地', dataIndex: 'location', key: 'location', width: 100 },
    { title: '所属队伍', dataIndex: 'team', key: 'team', width: 120 },
    { 
      title: '联系电话', dataIndex: 'contact', key: 'contact', width: 130,
      render: (phone) => <span><PhoneOutlined /> {phone}</span>
    },
  ];

  return (
    <div>
      <PageHeader 
        title="应急力量管理" 
        subtitle="查看和管理全省应急救援资源"
        breadcrumb={['应急指挥调度', '应急力量']}
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchResources} loading={loading}>
            刷新
          </Button>
        }
      />

      {/* 资源统计 */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="资源总数" value={statusCounts.total} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title="待命" value={statusCounts.standby} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderLeft: '3px solid #1890ff' }}>
            <Statistic title="执行中" value={statusCounts.dispatched} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderLeft: '3px solid #faad14' }}>
            <Statistic title="维护中" value={statusCounts.maintenance} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      {/* 地图和列表 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <MapPlaceholder 
            title="资源分布图" 
            height={450}
            markers={filteredResources.slice(0, 30)}
            legendItems={[
              { color: '#52c41a', label: '待命' },
              { color: '#1890ff', label: '执行中' },
              { color: '#faad14', label: '维护中' },
            ]}
          />
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="资源列表"
            extra={
              <Space>
                <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 100 }} size="small">
                  <Option value="all">全部类型</Option>
                  {resourceTypes.map(t => <Option key={t} value={t}>{t}</Option>)}
                </Select>
                <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 100 }} size="small">
                  <Option value="all">全部状态</Option>
                  <Option value="待命">待命</Option>
                  <Option value="执行中">执行中</Option>
                  <Option value="维护中">维护中</Option>
                </Select>
              </Space>
            }
            bodyStyle={{ padding: 0 }}
            style={{ height: 450 }}
          >
            <Table
              dataSource={filteredResources}
              columns={columns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 7, size: 'small' }}
              loading={loading}
              scroll={{ y: 340 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 资源详情弹窗 */}
      <Modal
        title={<span><CarOutlined /> 资源详情</span>}
        open={!!selectedResource}
        onCancel={() => setSelectedResource(null)}
        footer={null}
        width={500}
      >
        {selectedResource && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="资源名称">{selectedResource.name}</Descriptions.Item>
            <Descriptions.Item label="资源类型">{selectedResource.type}</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={selectedResource.status === '待命' ? 'green' : selectedResource.status === '执行中' ? 'blue' : 'orange'}>
                {selectedResource.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="所在地">
              <EnvironmentOutlined /> {selectedResource.location}
            </Descriptions.Item>
            <Descriptions.Item label="所属队伍">{selectedResource.team}</Descriptions.Item>
            <Descriptions.Item label="联系电话">
              <PhoneOutlined /> {selectedResource.contact}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default EmergencyResources;
