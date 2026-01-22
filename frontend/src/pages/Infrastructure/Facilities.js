/**
 * 省级基础设施监测预警子系统 - 设施档案
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Space, Select, Input, Button, Modal, Descriptions, Progress, Statistic, Typography } from 'antd';
import { SearchOutlined, EyeOutlined, BuildOutlined, EnvironmentOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import PageHeader from '../../components/PageHeader';
import { infrastructureApi } from '../../services/api';

const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;

const InfrastructureFacilities = () => {
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await infrastructureApi.getFacilities();
      setFacilities(res.data?.list || generateMockFacilities());
    } catch (error) {
      setFacilities(generateMockFacilities());
    }
    setLoading(false);
  };

  const generateMockFacilities = () => {
    const types = ['桥梁', '隧道', '收费站', '服务区', '监控中心'];
    const cities = ['省会市', '东部市', '西部市', '南部市', '北部市'];
    const statuses = ['优良', '良好', '一般', '较差'];
    const statusColors = { '优良': '#52c41a', '良好': '#1890ff', '一般': '#faad14', '较差': '#f5222d' };
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `${cities[i % cities.length]}${types[i % types.length]}${String(i + 1).padStart(2, '0')}`,
      type: types[i % types.length],
      code: `${types[i % types.length][0]}2024${String(i + 1).padStart(4, '0')}`,
      location: `G${Math.ceil((i + 1) / 10)}高速 K${100 + i * 10}`,
      build_year: 1995 + Math.floor(Math.random() * 29),
      health_score: Math.floor(60 + Math.random() * 40),
      status: statuses[Math.floor(Math.random() * 4)],
      status_color: statusColors[statuses[Math.floor(Math.random() * 4)]],
      last_inspection: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    }));
  };

  const viewDetail = async (facility) => {
    setSelectedFacility({
      ...facility,
      detail: {
        manager: `管理员${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
        phone: `1${Math.floor(30 + Math.random() * 70)}${Math.floor(10000000 + Math.random() * 90000000)}`,
        length: facility.type === '桥梁' || facility.type === '隧道' ? `${Math.floor(100 + Math.random() * 4900)}米` : '-',
        lanes: Math.floor(2 + Math.random() * 6),
      },
      monitoring: {
        temperature: (15 + Math.random() * 20).toFixed(1),
        humidity: (40 + Math.random() * 40).toFixed(1),
        vibration: (Math.random() * 5).toFixed(2),
        displacement: (Math.random() * 2).toFixed(3),
      },
      monitoring_history: Array.from({ length: 24 }, (_, h) => ({
        time: `${String(h).padStart(2, '0')}:00`,
        temperature: (18 + Math.random() * 10).toFixed(1),
        vibration: (Math.random() * 3).toFixed(2),
      })),
    });
    setDetailVisible(true);
  };

  const filteredFacilities = facilities.filter(f => {
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (keyword && !f.name.includes(keyword) && !f.location.includes(keyword)) return false;
    return true;
  });

  const columns = [
    { title: '设施名称', dataIndex: 'name', key: 'name', render: (text, record) => <a onClick={() => viewDetail(record)}><BuildOutlined style={{ marginRight: 4 }} />{text}</a> },
    { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
    { title: '编码', dataIndex: 'code', key: 'code', width: 130 },
    { title: '位置', dataIndex: 'location', key: 'location', width: 150 },
    { title: '建成年份', dataIndex: 'build_year', key: 'build_year', width: 90 },
    { title: '健康评分', dataIndex: 'health_score', key: 'health_score', width: 100, render: (score) => <Progress percent={score} size="small" strokeColor={score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#f5222d'} /> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (status, record) => <Tag color={record.status_color}>{status}</Tag> },
    { title: '最近检查', dataIndex: 'last_inspection', key: 'last_inspection', width: 110 },
    { title: '操作', key: 'action', width: 80, render: (_, record) => <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => viewDetail(record)}>详情</Button> },
  ];

  const monitoringChartOption = selectedFacility ? {
    tooltip: { trigger: 'axis' },
    legend: { data: ['温度', '振动'] },
    xAxis: { type: 'category', data: selectedFacility.monitoring_history?.map(d => d.time) },
    yAxis: [{ type: 'value', name: '温度(°C)' }, { type: 'value', name: '振动(mm/s)' }],
    series: [
      { name: '温度', type: 'line', data: selectedFacility.monitoring_history?.map(d => d.temperature), smooth: true, itemStyle: { color: '#fa8c16' } },
      { name: '振动', type: 'line', yAxisIndex: 1, data: selectedFacility.monitoring_history?.map(d => d.vibration), smooth: true, itemStyle: { color: '#1890ff' } },
    ]
  } : {};

  return (
    <div>
      <PageHeader 
        title="设施档案管理" 
        subtitle="查看和管理基础设施核心档案信息"
        breadcrumb={['基础设施监测', '设施档案']}
      />

      {/* 筛选条件 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 120 }}>
            <Option value="all">全部类型</Option>
            <Option value="桥梁">桥梁</Option>
            <Option value="隧道">隧道</Option>
            <Option value="收费站">收费站</Option>
            <Option value="服务区">服务区</Option>
            <Option value="监控中心">监控中心</Option>
          </Select>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 120 }}>
            <Option value="all">全部状态</Option>
            <Option value="优良">优良</Option>
            <Option value="良好">良好</Option>
            <Option value="一般">一般</Option>
            <Option value="较差">较差</Option>
          </Select>
          <Search placeholder="搜索设施名称或位置" onSearch={setKeyword} style={{ width: 250 }} />
        </Space>
      </Card>

      {/* 设施列表 */}
      <Card>
        <Table dataSource={filteredFacilities} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      {/* 设施详情弹窗 */}
      <Modal title={<span><BuildOutlined /> 设施详情</span>} open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={900}>
        {selectedFacility && (
          <>
            <Row gutter={16}>
              <Col span={16}>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="设施名称">{selectedFacility.name}</Descriptions.Item>
                  <Descriptions.Item label="设施编码">{selectedFacility.code}</Descriptions.Item>
                  <Descriptions.Item label="设施类型">{selectedFacility.type}</Descriptions.Item>
                  <Descriptions.Item label="建成年份">{selectedFacility.build_year}年</Descriptions.Item>
                  <Descriptions.Item label="所在位置" span={2}><EnvironmentOutlined /> {selectedFacility.location}</Descriptions.Item>
                  <Descriptions.Item label="管理人员">{selectedFacility.detail?.manager}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{selectedFacility.detail?.phone}</Descriptions.Item>
                  {selectedFacility.detail?.length !== '-' && <Descriptions.Item label="长度">{selectedFacility.detail?.length}</Descriptions.Item>}
                  <Descriptions.Item label="车道数">{selectedFacility.detail?.lanes}车道</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={8}>
                <Card size="small" title="健康状态">
                  <div style={{ textAlign: 'center' }}>
                    <Progress type="circle" percent={selectedFacility.health_score} strokeColor={selectedFacility.health_score >= 80 ? '#52c41a' : selectedFacility.health_score >= 60 ? '#faad14' : '#f5222d'} />
                    <div style={{ marginTop: 8 }}><Tag color={selectedFacility.status_color}>{selectedFacility.status}</Tag></div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card size="small" title="实时监测数据" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={6}><Statistic title="温度" value={selectedFacility.monitoring?.temperature} suffix="°C" /></Col>
                <Col span={6}><Statistic title="湿度" value={selectedFacility.monitoring?.humidity} suffix="%" /></Col>
                <Col span={6}><Statistic title="振动" value={selectedFacility.monitoring?.vibration} suffix="mm/s" /></Col>
                <Col span={6}><Statistic title="位移" value={selectedFacility.monitoring?.displacement} suffix="mm" /></Col>
              </Row>
            </Card>

            <Card size="small" title="监测数据趋势(24小时)" style={{ marginTop: 16 }}>
              <ReactECharts option={monitoringChartOption} style={{ height: 250 }} />
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
};

export default InfrastructureFacilities;
