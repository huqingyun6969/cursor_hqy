/**
 * 省级基础设施监测预警子系统 - 移动端一键查询模拟
 */
import React, { useState } from 'react';
import { Card, Input, Button, Row, Col, Descriptions, Tag, Progress, Statistic, Space, Typography, Empty, message } from 'antd';
import { SearchOutlined, ScanOutlined, BuildOutlined, EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import PageHeader from '../../components/PageHeader';

const { Search } = Input;
const { Text, Title } = Typography;

const InfrastructureMobile = () => {
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = (value) => {
    if (!value) {
      message.warning('请输入设施编码或关键词');
      return;
    }
    setSearching(true);
    
    // 模拟搜索延迟
    setTimeout(() => {
      setResult({
        id: 1,
        name: `${value.includes('桥') ? '省会大桥01' : value.includes('隧') ? '东部隧道03' : '西部收费站02'}`,
        type: value.includes('桥') ? '桥梁' : value.includes('隧') ? '隧道' : '收费站',
        code: `Q20240001`,
        location: 'G1高速 K125+500',
        build_year: 2008,
        health_score: Math.floor(70 + Math.random() * 30),
        status: Math.random() > 0.3 ? '良好' : '一般',
        status_color: Math.random() > 0.3 ? '#52c41a' : '#faad14',
        monitoring: {
          temperature: (15 + Math.random() * 20).toFixed(1),
          humidity: (40 + Math.random() * 40).toFixed(1),
          vibration: (Math.random() * 5).toFixed(2),
          displacement: (Math.random() * 2).toFixed(3),
        },
        last_inspection: '2024-01-10',
        alerts: Math.random() > 0.7 ? ['振动异常'] : [],
      });
      setSearching(false);
    }, 800);
  };

  const handleScan = () => {
    message.info('扫码功能模拟中...');
    handleSearch('桥梁');
  };

  const clearResult = () => {
    setResult(null);
  };

  const monitoringChartOption = result ? {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: Array.from({ length: 12 }, (_, i) => `${String(i * 2).padStart(2, '0')}:00`) },
    yAxis: { type: 'value' },
    series: [
      { name: '振动', type: 'line', data: Array.from({ length: 12 }, () => (Math.random() * 3).toFixed(2)), smooth: true, itemStyle: { color: '#1890ff' } },
    ]
  } : {};

  return (
    <div>
      <PageHeader 
        title="移动端一键查询" 
        subtitle="模拟移动端设施快速查询功能"
        breadcrumb={['基础设施监测', '移动端查询']}
      />

      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} md={16} lg={12}>
          {/* 查询卡片 */}
          <Card 
            className="mobile-query-card"
            style={{ 
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              borderRadius: 12,
              marginBottom: 16
            }}
          >
            <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
              <BuildOutlined /> 设施一键查询
            </Title>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Search
                placeholder="输入设施编码或名称关键词"
                allowClear
                enterButton={<><SearchOutlined /> 查询</>}
                size="large"
                loading={searching}
                onSearch={handleSearch}
              />
              <Button 
                block 
                size="large" 
                icon={<ScanOutlined />}
                onClick={handleScan}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
              >
                扫码查询
              </Button>
            </Space>
          </Card>

          {/* 查询结果 */}
          {result ? (
            <Card 
              title={<span><BuildOutlined /> 查询结果</span>}
              extra={<Button type="link" icon={<ReloadOutlined />} onClick={clearResult}>重新查询</Button>}
            >
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="设施名称">
                  <Text strong>{result.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="设施类型">
                  <Tag color="blue">{result.type}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="设施编码">{result.code}</Descriptions.Item>
                <Descriptions.Item label="所在位置">
                  <EnvironmentOutlined /> {result.location}
                </Descriptions.Item>
                <Descriptions.Item label="建成年份">{result.build_year}年</Descriptions.Item>
                <Descriptions.Item label="健康状态">
                  <Space>
                    <Progress 
                      type="circle" 
                      percent={result.health_score} 
                      width={50}
                      strokeColor={result.health_score >= 80 ? '#52c41a' : '#faad14'}
                    />
                    <Tag color={result.status_color}>{result.status}</Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="最近检查">{result.last_inspection}</Descriptions.Item>
              </Descriptions>

              {/* 实时监测 */}
              <Card size="small" title="实时监测数据" style={{ marginTop: 16 }}>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Statistic title="温度" value={result.monitoring.temperature} suffix="°C" valueStyle={{ fontSize: 20 }} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="湿度" value={result.monitoring.humidity} suffix="%" valueStyle={{ fontSize: 20 }} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="振动" value={result.monitoring.vibration} suffix="mm/s" valueStyle={{ fontSize: 20 }} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="位移" value={result.monitoring.displacement} suffix="mm" valueStyle={{ fontSize: 20 }} />
                  </Col>
                </Row>
              </Card>

              {/* 报警信息 */}
              {result.alerts.length > 0 && (
                <Card size="small" title="报警信息" style={{ marginTop: 16, borderColor: '#f5222d' }}>
                  {result.alerts.map((alert, idx) => (
                    <Tag key={idx} color="red">{alert}</Tag>
                  ))}
                </Card>
              )}

              {/* 监测趋势 */}
              <Card size="small" title="振动趋势(24h)" style={{ marginTop: 16 }}>
                <ReactECharts option={monitoringChartOption} style={{ height: 200 }} />
              </Card>
            </Card>
          ) : (
            <Card>
              <Empty description="请输入设施编码或名称进行查询" />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default InfrastructureMobile;
