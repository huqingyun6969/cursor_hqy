import { useEffect, useState } from 'react'
import { Table, Button, Select, Space, Typography, Card, Statistic, Row, Col, Tag, Modal, message, Spin } from 'antd'
import { PlayCircleOutlined, HistoryOutlined, CheckCircleOutlined, CloseCircleOutlined, FieldTimeOutlined } from '@ant-design/icons'
import { listRuleGroups, executeRuleGroup, listExecutionHistory, getExecutionDetail } from '../api'
import type { RuleGroup, ExecutionResultVO, ExecutionRecord, ExecutionDetail } from '../types'

export default function ExecutionPage() {
  const [groups, setGroups] = useState<RuleGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<number | undefined>()
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<ExecutionResultVO | null>(null)
  const [history, setHistory] = useState<ExecutionRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [detailData, setDetailData] = useState<ExecutionDetail[]>([])

  useEffect(() => {
    listRuleGroups().then(r => setGroups(r.data || []))
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await listExecutionHistory()
      setHistory(res.data || [])
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleExecute = async () => {
    if (!selectedGroup) { message.warning('请先选择规则组'); return }
    setExecuting(true)
    setResult(null)
    try {
      const res = await executeRuleGroup(selectedGroup)
      if (res.code === 200) {
        setResult(res.data)
        message.success('执行完成')
        fetchHistory()
      } else {
        message.error(res.message || '执行失败')
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || '执行失败')
    } finally {
      setExecuting(false)
    }
  }

  const showDetail = async (executionId: number) => {
    const res = await getExecutionDetail(executionId)
    setDetailData(res.data || [])
    setDetailModal(true)
  }

  const resultColumns = [
    { title: '字段', dataIndex: 'fieldName', width: 140 },
    { title: '规则类型', dataIndex: 'ruleType', width: 140,
      render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '描述', dataIndex: 'ruleDescription', ellipsis: true },
    { title: '不符合规则的数据行数', dataIndex: 'violatedRows', width: 170,
      render: (v: number) => <span style={{ color: v > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>{v}</span> },
    { title: '数据总量', dataIndex: 'totalRows', width: 100 },
    { title: '符合规则的数据行占比', dataIndex: 'complianceRate', width: 170,
      render: (v: number) => <span style={{ fontWeight: 'bold' }}>{v?.toFixed(2)}%</span> },
    { title: '质量结论', dataIndex: 'qualityResult', width: 100,
      render: (v: string) => v === 'PASS'
        ? <Tag icon={<CheckCircleOutlined />} color="success">符合</Tag>
        : <Tag icon={<CloseCircleOutlined />} color="error">不符合</Tag> },
  ]

  const historyColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '规则组', dataIndex: 'ruleGroupName', width: 200 },
    { title: '数据行数', dataIndex: 'totalRows', width: 100 },
    { title: '规则数', dataIndex: 'totalRules', width: 80 },
    { title: '通过', dataIndex: 'passedRules', width: 70,
      render: (v: number) => <Tag color="green">{v}</Tag> },
    { title: '失败', dataIndex: 'failedRules', width: 70,
      render: (v: number) => <Tag color={v > 0 ? 'red' : 'green'}>{v}</Tag> },
    { title: '状态', dataIndex: 'status', width: 90,
      render: (v: string) => {
        const colorMap: Record<string, string> = { COMPLETED: 'green', FAILED: 'red', RUNNING: 'blue' }
        return <Tag color={colorMap[v] || 'default'}>{v}</Tag>
      }},
    { title: '耗时(ms)', dataIndex: 'durationMs', width: 100 },
    { title: '开始时间', dataIndex: 'startTime', width: 180 },
    { title: '操作', width: 100,
      render: (_: unknown, record: ExecutionRecord) => (
        <Button type="link" onClick={() => showDetail(record.id)}>查看详情</Button>
      )},
  ]

  const detailColumns = [
    { title: '字段', dataIndex: 'fieldName', width: 120 },
    { title: '规则类型', dataIndex: 'ruleType', width: 140 },
    { title: '描述', dataIndex: 'ruleDescription', ellipsis: true },
    { title: '不符合数', dataIndex: 'violatedRows', width: 100 },
    { title: '总数', dataIndex: 'totalRows', width: 80 },
    { title: '符合率', dataIndex: 'complianceRate', width: 100,
      render: (v: number) => `${v?.toFixed(2)}%` },
    { title: '结论', dataIndex: 'qualityResult', width: 80,
      render: (v: string) => v === 'PASS' ? <Tag color="success">符合</Tag> : <Tag color="error">不符合</Tag> },
    { title: '耗时(ms)', dataIndex: 'durationMs', width: 90 },
  ]

  return (
    <>
      <Typography.Title level={5}>规则执行</Typography.Title>

      <Card style={{ marginBottom: 24 }}>
        <Space size="large" align="center">
          <Select placeholder="选择规则组" style={{ width: 300 }} value={selectedGroup}
            onChange={setSelectedGroup} options={groups.map(g => ({ value: g.id, label: g.name }))} />
          <Button type="primary" icon={<PlayCircleOutlined />}
            onClick={handleExecute} loading={executing} size="large">
            {executing ? '执行中...' : '执行校验'}
          </Button>
        </Space>
      </Card>

      {executing && (
        <Card style={{ marginBottom: 24, textAlign: 'center' }}>
          <Spin size="large" tip="正在执行规则校验，请稍候..." />
        </Card>
      )}

      {result && (
        <Card title={`执行结果 - ${result.ruleGroupName}`} style={{ marginBottom: 24 }}
          extra={<Tag icon={<FieldTimeOutlined />} color="processing">耗时 {result.durationMs}ms</Tag>}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic title="数据总量" value={result.totalRows} />
            </Col>
            <Col span={6}>
              <Statistic title="规则总数" value={result.totalRules} />
            </Col>
            <Col span={6}>
              <Statistic title="通过规则数" value={result.passedRules} valueStyle={{ color: '#3f8600' }} />
            </Col>
            <Col span={6}>
              <Statistic title="失败规则数" value={result.failedRules}
                valueStyle={{ color: result.failedRules > 0 ? '#cf1322' : '#3f8600' }} />
            </Col>
          </Row>
          <Table columns={resultColumns} dataSource={result.details} rowKey={(_, i) => String(i)}
            size="middle" pagination={false}
            rowClassName={(record) => record.qualityResult === 'FAIL' ? 'ant-table-row-fail' : ''} />
        </Card>
      )}

      <Card title={<><HistoryOutlined /> 执行历史</>} style={{ marginBottom: 24 }}>
        <Table columns={historyColumns} dataSource={history} rowKey="id" loading={historyLoading}
          size="middle" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="执行详情" open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={1100}>
        <Table columns={detailColumns} dataSource={detailData} rowKey="id" size="small" pagination={false} />
      </Modal>
    </>
  )
}
