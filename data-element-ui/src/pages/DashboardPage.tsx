import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Typography, Tag, Table, Spin } from 'antd'
import {
  DatabaseOutlined, AuditOutlined, PlayCircleOutlined, FileTextOutlined,
  AlertOutlined, SettingOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CloudServerOutlined, TableOutlined, CodeOutlined
} from '@ant-design/icons'
import { getDashboardStats } from '../api'

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(r => { if (r.code === 200) setStats(r.data); setLoading(false) })
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>
  if (!stats) return null

  const typeUsage = (stats.ruleTypeUsage || {}) as Record<string, number>

  return (
    <>
      <Typography.Title level={4} style={{ marginBottom: 24 }}>数据要素平台 - 规则引擎概览</Typography.Title>

      <Row gutter={[16, 16]}>
        <Col span={4}>
          <Card size="small" hoverable>
            <Statistic title={<><DatabaseOutlined /> 数据源</>} value={stats.dataSourceTotal as number}
              suffix={<span style={{ fontSize: 12 }}>启用 {stats.dataSourceEnabled as number}</span>} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" hoverable>
            <Statistic title={<><SettingOutlined /> 规则类型</>} value={stats.ruleTypeCount as number} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" hoverable>
            <Statistic title={<><AuditOutlined /> 规则组</>} value={stats.ruleGroupCount as number} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" hoverable>
            <Statistic title={<><TableOutlined /> 校验目标表</>} value={stats.targetTableCount as number} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" hoverable>
            <Statistic title={<><CodeOutlined /> 规则总数</>} value={stats.ruleCount as number} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" hoverable>
            <Statistic title={<><FileTextOutlined /> 质量报告</>} value={stats.reportCount as number} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title={<><CloudServerOutlined /> 主任务执行情况</>} size="small">
            <Row gutter={16}>
              <Col span={6}><Statistic title="总任务" value={stats.taskTotal as number} /></Col>
              <Col span={6}><Statistic title={<><CheckCircleOutlined /> 已完成</>} value={stats.taskCompleted as number} valueStyle={{ color: '#52c41a' }} /></Col>
              <Col span={6}><Statistic title={<><ExclamationCircleOutlined /> 失败</>} value={stats.taskFailed as number} valueStyle={{ color: '#ff4d4f' }} /></Col>
              <Col span={6}><Statistic title={<><ClockCircleOutlined /> 执行中/排队</>} value={(stats.taskRunning as number) + (stats.taskQueued as number)} valueStyle={{ color: '#1890ff' }} /></Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<><AlertOutlined /> 数据质量工单</>} size="small">
            <Row gutter={16}>
              <Col span={6}><Statistic title="工单总数" value={stats.workOrderTotal as number} /></Col>
              <Col span={6}><Statistic title="待处理" value={stats.workOrderPending as number} valueStyle={{ color: '#faad14' }} /></Col>
              <Col span={6}><Statistic title="处理中" value={stats.workOrderProcessing as number} valueStyle={{ color: '#1890ff' }} /></Col>
              <Col span={6}><Statistic title="已完成" value={stats.workOrderCompleted as number} valueStyle={{ color: '#52c41a' }} /></Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title={<><ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> 异常数据统计</>} size="small">
            <Statistic title="累计异常数据" value={stats.violationTotal as number} valueStyle={{ color: '#ff4d4f', fontSize: 36 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<><SettingOutlined /> 规则类型使用分布</>} size="small">
            <Table size="small" pagination={false} dataSource={Object.entries(typeUsage).map(([k, v]) => ({ type: k, count: v }))} rowKey="type"
              columns={[
                { title: '规则类型', dataIndex: 'type', render: (v: string) => <Tag color="blue">{v}</Tag> },
                { title: '被引用次数', dataIndex: 'count', width: 100 },
              ]} scroll={{ y: 200 }} />
          </Card>
        </Col>
      </Row>
    </>
  )
}
