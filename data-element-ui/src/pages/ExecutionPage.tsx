import { useEffect, useState, useRef } from 'react'
import { Table, Button, Select, Space, Typography, Card, Statistic, Row, Col, Tag, Modal, message, Progress, Steps, Descriptions, Badge } from 'antd'
import { PlayCircleOutlined, StopOutlined, ReloadOutlined, DashboardOutlined, EyeOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { listRuleGroups, submitTask, cancelTask, getTask, listTasks, getTaskSteps, getEngineStatus } from '../api'
import type { RuleGroup, ExecutionTask, ExecutionStepLog, EngineStatus } from '../types'

const statusColorMap: Record<string, string> = { QUEUED: 'default', RUNNING: 'processing', COMPLETED: 'success', FAILED: 'error', CANCELLED: 'warning' }
const statusTextMap: Record<string, string> = { QUEUED: '排队中', RUNNING: '执行中', COMPLETED: '已完成', FAILED: '失败', CANCELLED: '已取消' }

export default function ExecutionPage() {
  const [groups, setGroups] = useState<RuleGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<number | undefined>()
  const [tasks, setTasks] = useState<ExecutionTask[]>([])
  const [loading, setLoading] = useState(false)
  const [engine, setEngine] = useState<EngineStatus | null>(null)
  const [detailModal, setDetailModal] = useState(false)
  const [currentTask, setCurrentTask] = useState<ExecutionTask | null>(null)
  const [steps, setSteps] = useState<ExecutionStepLog[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [grpRes, taskRes, engRes] = await Promise.all([listRuleGroups(), listTasks(), getEngineStatus()])
      setGroups(grpRes.data || [])
      setTasks(taskRes.data || [])
      if (engRes.code === 200) setEngine(engRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchAll()
    pollRef.current = setInterval(fetchAll, 8000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const handleSubmit = async () => {
    if (!selectedGroup) { message.warning('请先选择规则组'); return }
    const res = await submitTask(selectedGroup)
    if (res.code === 200) { message.success(`任务已提交 (ID: ${res.data.id})`); fetchAll() }
    else message.error(res.message)
  }

  const handleCancel = async (taskId: number) => {
    await cancelTask(taskId)
    message.success('任务已取消')
    fetchAll()
  }

  const showDetail = async (taskId: number) => {
    const [taskRes, stepsRes] = await Promise.all([getTask(taskId), getTaskSteps(taskId)])
    if (taskRes.code === 200) setCurrentTask(taskRes.data)
    setSteps(stepsRes.data || [])
    setDetailModal(true)
  }

  const refreshDetail = async () => {
    if (!currentTask) return
    const [taskRes, stepsRes] = await Promise.all([getTask(currentTask.id), getTaskSteps(currentTask.id)])
    if (taskRes.code === 200) setCurrentTask(taskRes.data)
    setSteps(stepsRes.data || [])
  }

  const runningCount = tasks.filter(t => t.status === 'RUNNING').length
  const queuedCount = tasks.filter(t => t.status === 'QUEUED').length

  const taskColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '规则组', dataIndex: 'ruleGroupName', width: 180, ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 90,
      render: (v: string) => <Badge status={statusColorMap[v] as 'default'} text={statusTextMap[v] || v} /> },
    { title: '进度', dataIndex: 'progress', width: 140,
      render: (v: number, r: ExecutionTask) => (
        <Progress percent={v || 0} size="small" status={r.status === 'FAILED' ? 'exception' : r.status === 'RUNNING' ? 'active' : undefined}
          format={() => `${r.completedRules || 0}/${r.totalRules || 0}`} />
      )},
    { title: '当前步骤', dataIndex: 'currentStep', width: 160, ellipsis: true },
    { title: '线程', dataIndex: 'threadName', width: 120, ellipsis: true },
    { title: 'CPU%', dataIndex: 'cpuUsagePct', width: 70, render: (v: number) => v?.toFixed(1) || '-' },
    { title: '内存(MB)', dataIndex: 'memoryUsageMb', width: 80, render: (v: number) => v || '-' },
    { title: '耗时(ms)', dataIndex: 'durationMs', width: 90, render: (v: number) => v || '-' },
    { title: '提交时间', dataIndex: 'queuedAt', width: 170, ellipsis: true },
    { title: '操作', width: 160, render: (_: unknown, r: ExecutionTask) => (
      <Space>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => showDetail(r.id)}>详情</Button>
        {(r.status === 'RUNNING' || r.status === 'QUEUED') && (
          <Button type="link" size="small" danger icon={<StopOutlined />} onClick={() => handleCancel(r.id)}>终止</Button>
        )}
      </Space>
    )},
  ]

  return (
    <>
      <Typography.Title level={5}>规则执行中心</Typography.Title>

      {engine && (
        <Card size="small" style={{ marginBottom: 16, background: engine.overloaded ? '#fff2f0' : '#f6ffed' }}
          title={<><DashboardOutlined /> 执行引擎状态 {engine.overloaded && <Tag color="red">资源过载</Tag>}</>}
          extra={<Button size="small" icon={<ReloadOutlined />} onClick={fetchAll}>刷新</Button>}>
          <Row gutter={16}>
            <Col span={3}><Statistic title="活跃线程" value={engine.activeThreads} suffix={`/ ${engine.maxPoolSize}`} /></Col>
            <Col span={3}><Statistic title="队列等待" value={engine.queueSize} suffix={`/ ${engine.queueCapacity}`} /></Col>
            <Col span={3}><Statistic title="执行中" value={runningCount} valueStyle={{ color: runningCount > 0 ? '#1890ff' : undefined }} /></Col>
            <Col span={3}><Statistic title="排队中" value={queuedCount} /></Col>
            <Col span={3}><Statistic title="CPU%" value={engine.cpuUsage} suffix="%" valueStyle={{ color: (engine.cpuUsage || 0) > 80 ? '#ff4d4f' : undefined }} /></Col>
            <Col span={3}><Statistic title="内存" value={engine.heapUsedMb || 0} suffix={`/ ${engine.heapMaxMb || 0} MB`} /></Col>
            <Col span={3}><Statistic title="内存%" value={engine.heapUsagePct || 0} suffix="%" valueStyle={{ color: (engine.heapUsagePct || 0) > 80 ? '#ff4d4f' : undefined }} /></Col>
            <Col span={3}><Statistic title="已完成总数" value={engine.completedTasks} /></Col>
          </Row>
        </Card>
      )}

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space size="large" align="center">
          <Select placeholder="选择规则组" showSearch optionFilterProp="label" style={{ width: 320 }}
            value={selectedGroup} onChange={setSelectedGroup}
            options={groups.map(g => ({ value: g.id, label: `${g.name}${g.tableName ? ' (' + g.tableName + ')' : ''}` }))} />
          <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleSubmit} size="large">
            提交执行任务
          </Button>
        </Space>
      </Card>

      <Card title={<><PlayCircleOutlined /> 执行任务列表</>} size="small"
        extra={<Space>
          <Tag>执行中: {runningCount}</Tag><Tag>排队: {queuedCount}</Tag>
          <Typography.Text type="secondary">每8秒自动刷新</Typography.Text>
        </Space>}>
        <Table columns={taskColumns} dataSource={tasks} rowKey="id" loading={loading} size="small" pagination={{ pageSize: 15 }} />
      </Card>

      <Modal title={`任务详情 #${currentTask?.id || ''}`} open={detailModal}
        onCancel={() => setDetailModal(false)} footer={null} width={1000} destroyOnClose>
        {currentTask && (
          <>
            <Descriptions size="small" bordered column={3} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="任务ID">{currentTask.id}</Descriptions.Item>
              <Descriptions.Item label="规则组">{currentTask.ruleGroupName}</Descriptions.Item>
              <Descriptions.Item label="状态"><Badge status={statusColorMap[currentTask.status] as 'default'} text={statusTextMap[currentTask.status]} /></Descriptions.Item>
              <Descriptions.Item label="线程">{currentTask.threadName || '-'}</Descriptions.Item>
              <Descriptions.Item label="CPU">{currentTask.cpuUsagePct || 0}%</Descriptions.Item>
              <Descriptions.Item label="内存">{currentTask.memoryUsageMb || 0} MB</Descriptions.Item>
              <Descriptions.Item label="提交时间">{currentTask.queuedAt}</Descriptions.Item>
              <Descriptions.Item label="开始时间">{currentTask.startedAt || '-'}</Descriptions.Item>
              <Descriptions.Item label="耗时">{currentTask.durationMs || 0} ms</Descriptions.Item>
            </Descriptions>

            <Progress percent={currentTask.progress || 0} status={currentTask.status === 'FAILED' ? 'exception' : currentTask.status === 'RUNNING' ? 'active' : undefined}
              format={() => `${currentTask.completedRules || 0}/${currentTask.totalRules || 0} 步`} style={{ marginBottom: 16 }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>执行步骤链路</Typography.Title>
              <Space>
                <Button size="small" icon={<ReloadOutlined />} onClick={refreshDetail}>刷新</Button>
                {(currentTask.status === 'RUNNING' || currentTask.status === 'QUEUED') && (
                  <Button size="small" danger icon={<StopOutlined />} onClick={() => { handleCancel(currentTask.id); refreshDetail() }}>强制终止</Button>
                )}
              </Space>
            </div>

            <Steps direction="vertical" size="small" current={steps.findIndex(s => s.status === 'RUNNING')}
              items={steps.map(s => ({
                title: <span>{s.stepName} <Tag>{s.ruleType}</Tag> <Typography.Text type="secondary">[{s.fieldName}]</Typography.Text></span>,
                description: (
                  <Space size="large">
                    <span>总行数: {s.totalRows || '-'}</span>
                    <span>违规: <span style={{ color: (s.violatedRows || 0) > 0 ? '#ff4d4f' : '#52c41a' }}>{s.violatedRows ?? '-'}</span></span>
                    <span>耗时: {s.durationMs || '-'}ms</span>
                    {s.memoryDeltaMb ? <span>内存: {s.memoryDeltaMb}MB</span> : null}
                    {s.errorMessage && <Typography.Text type="danger">{s.errorMessage}</Typography.Text>}
                  </Space>
                ),
                status: s.status === 'COMPLETED' ? 'finish' as const :
                        s.status === 'RUNNING' ? 'process' as const :
                        s.status === 'FAILED' ? 'error' as const : 'wait' as const,
              }))} />
            {currentTask.errorMessage && (
              <Card size="small" style={{ marginTop: 16, background: '#fff2f0' }}>
                <Typography.Text type="danger"><strong>错误信息：</strong>{currentTask.errorMessage}</Typography.Text>
              </Card>
            )}
          </>
        )}
      </Modal>
    </>
  )
}
