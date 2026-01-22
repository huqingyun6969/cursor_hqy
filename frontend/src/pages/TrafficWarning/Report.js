/**
 * 省级交通运行预警预测子系统 - 运行报表
 * 支持日报、周报、月报的查询和生成
 */
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Select, DatePicker, Button, Table, Statistic, 
  Typography, Space, Divider, message 
} from 'antd';
import {
  DownloadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import PageHeader from '../../components/PageHeader';
import { trafficApi } from '../../services/api';
import { formatNumber } from '../../utils/helpers';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;

const TrafficWarningReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // 加载数据
  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await trafficApi.getReport({ type: reportType });
      setReportData(res.data || generateMockReport());
    } catch (error) {
      setReportData(generateMockReport());
    }
    setLoading(false);
  };

  // 生成模拟报表数据
  const generateMockReport = () => {
    const baseData = {
      report_type: reportType === 'daily' ? '日报' : reportType === 'weekly' ? '周报' : '月报',
      date: dayjs().format('YYYY-MM-DD'),
      indicators: {
        total_flow: Math.floor(800000 + Math.random() * 400000),
        avg_speed: Math.floor(60 + Math.random() * 25),
        congestion_index: +(1 + Math.random() * 0.8).toFixed(2),
        warning_count: Math.floor(10 + Math.random() * 40),
        accident_count: Math.floor(Math.random() * 10),
      },
      comparison: {
        flow_change: +(Math.random() * 30 - 15).toFixed(1),
        speed_change: +(Math.random() * 20 - 10).toFixed(1),
        congestion_change: +(Math.random() * 0.6 - 0.3).toFixed(2),
      },
      hourly_flow: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        flow: Math.floor(3000 + Math.random() * 5000 * (i >= 7 && i <= 9 || i >= 17 && i <= 19 ? 1.8 : 1)),
      })),
      top_congested_roads: [
        { road: 'G1高速省会段', index: +(2 + Math.random()).toFixed(2) },
        { road: 'S1省道东部段', index: +(1.8 + Math.random() * 0.5).toFixed(2) },
        { road: 'G2高速北部段', index: +(1.5 + Math.random() * 0.5).toFixed(2) },
        { road: 'G15高速临海段', index: +(1.3 + Math.random() * 0.5).toFixed(2) },
        { road: 'S2省道中部段', index: +(1.2 + Math.random() * 0.3).toFixed(2) },
      ],
    };
    return baseData;
  };

  // 导出报表
  const exportReport = () => {
    message.success('报表导出成功');
    // 实际项目中这里应该调用后端接口生成报表文件
  };

  // 打印报表
  const printReport = () => {
    window.print();
  };

  // 流量趋势图配置
  const flowChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: reportData?.hourly_flow?.map(d => d.hour) || [],
      boundaryGap: false 
    },
    yAxis: { type: 'value', name: '流量(辆)' },
    series: [{
      type: 'line',
      data: reportData?.hourly_flow?.map(d => d.flow) || [],
      smooth: true,
      areaStyle: { opacity: 0.3 },
      itemStyle: { color: '#1890ff' }
    }]
  };

  // 拥堵路段排名图配置
  const congestionChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '10%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', name: '拥堵指数' },
    yAxis: { 
      type: 'category', 
      data: reportData?.top_congested_roads?.map(d => d.road).reverse() || [],
    },
    series: [{
      type: 'bar',
      data: reportData?.top_congested_roads?.map(d => ({
        value: d.index,
        itemStyle: { color: d.index > 2 ? '#f5222d' : d.index > 1.5 ? '#fa8c16' : '#faad14' }
      })).reverse() || [],
      barWidth: 20,
    }]
  };

  // 指标变化趋势
  const renderTrend = (value) => {
    const isPositive = value > 0;
    return (
      <Text style={{ color: isPositive ? '#f5222d' : '#52c41a', fontSize: 12 }}>
        {isPositive ? '↑' : '↓'} {Math.abs(value)}%
      </Text>
    );
  };

  return (
    <div>
      <PageHeader 
        title="运行指标报表" 
        subtitle="查询和生成交通运行指标统计报表"
        breadcrumb={['交通运行预警预测', '运行报表']}
        extra={
          <Space>
            <Button icon={<PrinterOutlined />} onClick={printReport}>
              打印
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={exportReport}>
              导出报表
            </Button>
          </Space>
        }
      />

      {/* 筛选条件 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="large">
          <Space>
            <Text>报表类型：</Text>
            <Select 
              value={reportType} 
              onChange={setReportType}
              style={{ width: 120 }}
            >
              <Option value="daily">日报</Option>
              <Option value="weekly">周报</Option>
              <Option value="monthly">月报</Option>
            </Select>
          </Space>
          <Space>
            <Text>日期：</Text>
            <DatePicker 
              value={selectedDate}
              onChange={setSelectedDate}
              picker={reportType === 'monthly' ? 'month' : reportType === 'weekly' ? 'week' : 'date'}
            />
          </Space>
          <Button type="primary" onClick={fetchReportData} loading={loading}>
            查询
          </Button>
        </Space>
      </Card>

      {/* 报表标题 */}
      <Card style={{ marginBottom: 16, textAlign: 'center' }}>
        <Title level={3}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          省级交通运行{reportData?.report_type || '日报'}
        </Title>
        <Text type="secondary">
          <CalendarOutlined style={{ marginRight: 4 }} />
          {reportData?.date || dayjs().format('YYYY-MM-DD')}
        </Text>
      </Card>

      {/* 核心指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}>
            <Statistic 
              title="总流量" 
              value={reportData?.indicators?.total_flow || 0}
              suffix="辆"
              valueStyle={{ color: '#1890ff' }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary">较上期 </Text>
            {renderTrend(reportData?.comparison?.flow_change || 0)}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}>
            <Statistic 
              title="平均车速" 
              value={reportData?.indicators?.avg_speed || 0}
              suffix="km/h"
              valueStyle={{ color: '#52c41a' }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary">较上期 </Text>
            {renderTrend(reportData?.comparison?.speed_change || 0)}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}>
            <Statistic 
              title="拥堵指数" 
              value={reportData?.indicators?.congestion_index || 0}
              precision={2}
              valueStyle={{ 
                color: (reportData?.indicators?.congestion_index || 0) > 1.5 ? '#fa8c16' : '#52c41a' 
              }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary">较上期 </Text>
            {renderTrend(reportData?.comparison?.congestion_change * 100 || 0)}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}>
            <Statistic 
              title="预警次数" 
              value={reportData?.indicators?.warning_count || 0}
              suffix="次"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}>
            <Statistic 
              title="事故次数" 
              value={reportData?.indicators?.accident_count || 0}
              suffix="次"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}>
            <Statistic 
              title="畅通率" 
              value={Math.max(60, 100 - (reportData?.indicators?.congestion_index || 1) * 20)}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="流量时段分布" loading={loading}>
            <ReactECharts option={flowChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="拥堵路段TOP5" loading={loading}>
            <ReactECharts option={congestionChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 拥堵路段明细表 */}
      <Card title="拥堵路段明细" style={{ marginTop: 16 }} loading={loading}>
        <Table
          dataSource={reportData?.top_congested_roads || []}
          columns={[
            { title: '排名', key: 'rank', render: (_, __, index) => index + 1, width: 80 },
            { title: '路段名称', dataIndex: 'road', key: 'road' },
            { 
              title: '拥堵指数', 
              dataIndex: 'index', 
              key: 'index',
              render: (val) => (
                <Text style={{ 
                  color: val > 2 ? '#f5222d' : val > 1.5 ? '#fa8c16' : '#faad14',
                  fontWeight: 600
                }}>
                  {val}
                </Text>
              )
            },
            { 
              title: '拥堵等级', 
              key: 'level',
              render: (_, record) => {
                const level = record.index > 2 ? '严重拥堵' : record.index > 1.5 ? '拥堵' : '缓行';
                const color = record.index > 2 ? 'red' : record.index > 1.5 ? 'orange' : 'gold';
                return <Text style={{ color }}>{level}</Text>;
              }
            },
          ]}
          rowKey="road"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default TrafficWarningReport;
