import { useEffect, useState, useRef } from 'react'
import { Table, Button, Select, Space, Typography, Card, Statistic, Row, Col, Tag, Modal, message, Progress, Descriptions, Badge, Form, InputNumber, Input, DatePicker, Collapse, Popconfirm, Tooltip } from 'antd'
import { PlayCircleOutlined, StopOutlined, ReloadOutlined, DashboardOutlined, EyeOutlined, ThunderboltOutlined, PlusOutlined, ClockCircleOutlined, FieldTimeOutlined, WarningOutlined, CloudServerOutlined, DatabaseOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { listRuleGroups, listDataSources, submitTaskAdvanced, cancelTask, cancelSubTask, getTask, listTasks, getSubTasks, getTaskSteps, getEngineStatus, updateSubTaskTimeout, generateReport, listViolations } from '../api'
import type { RuleGroup, DataSourceConfig, ExecutionTask, ExecutionSubTask, ExecutionStepLog, EngineStatus, TaskCreateDTO } from '../types'

const statusColorMap: Record<string, string> = { QUEUED: 'default', RUNNING: 'processing', COMPLETED: 'success', FAILED: 'error', CANCELLED: 'warning' }
const statusTextMap: Record<string, string> = { QUEUED: '排队中', RUNNING: '执行中', COMPLETED: '已完成', FAILED: '失败', CANCELLED: '已取消' }

export default function TaskManagementPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<RuleGroup[]>([])
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([])
  const [tasks, setTasks] = useState<ExecutionTask[]>([])
  const [loading, setLoading] = useState(false)
  const [engine, setEngine] = useState<EngineStatus | null>(null)
  const [createModal, setCreateModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [currentTask, setCurrentTask] = useState<ExecutionTask | null>(null)
  const [subTasks, setSubTasks] = useState<ExecutionSubTask[]>([])
  const [steps, setSteps] = useState<ExecutionStepLog[]>([])
  const [form] = Form.useForm()
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [violationModal, setViolationModal] = useState(false)
  const [violations, setViolations] = useState<Record<string, unknown>[]>([])
  const [violationLoading, setViolationLoading] = useState(false)
  const [violationTotal, setViolationTotal] = useState(0)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [grpRes, dsRes, taskRes, engRes] = await Promise.all([
        listRuleGroups(), listDataSources(), listTasks(), getEngineStatus()
      ])
      setGroups(grpRes.data || [])
      setDataSources(dsRes.data || [])
      setTasks(taskRes.data || [])
      if (engRes.code === 200) setEngine(engRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchAll()
    pollRef.current = setInterval(fetchAll, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const dto: TaskCreateDTO = {
        ruleGroupId: values.ruleGroupId,
        dataSourceId: values.dataSourceId,
        tableName: values.tableName,
        specifiedFields: values.specifiedFields,
        timeFilterField: values.timeFilterField,
        timeRangeStart: values.timeRangeStart?.format?.('YYYY-MM-DD HH:mm:ss') || values.timeRangeStart,
        timeRangeEnd: values.timeRangeEnd?.format?.('YYYY-MM-DD HH:mm:ss') || values.timeRangeEnd,
        primaryKeyField: values.primaryKeyField,
        rowLimit: values.rowLimit,
        batchSize: values.batchSize,
        maxConcurrentSubTasks: values.maxConcurrentSubTasks,
        maxSubTaskTimeoutSec: values.maxSubTaskTimeoutSec,
        createdBy: values.createdBy || 'system',
        cronExpression: values.cronExpression,
      }
      const res = await submitTaskAdvanced(dto)
      if (res.code === 200) {
        message.success(`主任务已提交 (ID: ${res.data.id})，将自动拆分子任务`)
        setCreateModal(false)
        form.resetFields()
        fetchAll()
      } else if (res.message && res.message.includes('No rules defined')) {
        const groupId = dto.ruleGroupId
        Modal.warning({
          title: '该规则组尚未配置规则',
          content: '请先为规则组配置校验规则后再提交任务',
          okText: '去配置规则',
          onOk: () => { setCreateModal(false); navigate(`/rule-group/${groupId}/rules`) },
        })
      } else {
        message.error(res.message)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCancel = async (taskId: number) => {
    await cancelTask(taskId)
    message.success('主任务及所有子任务已取消')
    fetchAll()
  }

  const handleCancelSubTask = async (subTaskId: number) => {
    await cancelSubTask(subTaskId)
    message.success('子任务已取消')
    if (currentTask) showDetail(currentTask.id)
  }

  const showDetail = async (taskId: number) => {
    const [taskRes, subRes, stepsRes] = await Promise.all([
      getTask(taskId), getSubTasks(taskId), getTaskSteps(taskId)
    ])
    if (taskRes.code === 200) setCurrentTask(taskRes.data)
    setSubTasks(subRes.data || [])
    setSteps(stepsRes.data || [])
    setDetailModal(true)
  }

  const refreshDetail = async () => {
    if (!currentTask) return
    const [taskRes, subRes, stepsRes] = await Promise.all([
      getTask(currentTask.id), getSubTasks(currentTask.id), getTaskSteps(currentTask.id)
    ])
    if (taskRes.code === 200) setCurrentTask(taskRes.data)
    setSubTasks(subRes.data || [])
    setSteps(stepsRes.data || [])
  }

  const showViolations = async (taskId: number, page = 1) => {
    setViolationLoading(true)
    setViolationModal(true)
    try {
      const res = await listViolations({ taskId, current: page, size: 20 })
      if (res.code === 200) {
        const pg = res.data as { records: Record<string, unknown>[]; total: number }
        setViolations(pg.records || [])
        setViolationTotal(pg.total || 0)
      }
    } finally { setViolationLoading(false) }
  }

  const handleUpdateTimeout = async (taskId: number, sec: number) => {
    await updateSubTaskTimeout(taskId, sec)
    message.success(`子任务超时已更新为 ${sec} 秒`)
  }

  const runningCount = tasks.filter(t => t.status === 'RUNNING').length
  const queuedCount = tasks.filter(t => t.status === 'QUEUED').length

  const taskColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '规则组', dataIndex: 'ruleGroupName', width: 140, ellipsis: true },
    { title: '表名', dataIndex: 'tableName', width: 120, ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 90,
      render: (v: string) => <Badge status={statusColorMap[v] as 'default'} text={statusTextMap[v] || v} /> },
    { title: '总行数', dataIndex: 'totalRows', width: 90, render: (v: number) => v?.toLocaleString() || '-' },
    { title: '子任务', width: 100,
      render: (_: unknown, r: ExecutionTask) => <span>{r.completedSubTasks || 0}/{r.subTaskCount || 0}</span> },
    { title: '进度', dataIndex: 'progress', width: 120,
      render: (v: number, r: ExecutionTask) => (
        <Progress percent={v || 0} size="small"
          status={r.status === 'FAILED' ? 'exception' : r.status === 'RUNNING' ? 'active' : undefined}
          format={() => `${v || 0}%`} />
      )},
    { title: '来源', width: 70, render: (_: unknown, r: ExecutionTask) =>
      r.powerjobInstanceId ? <Tag color="purple">PowerJob</Tag> : <Tag>手动</Tag> },
    { title: '质量报告', dataIndex: 'reportId', width: 100,
      render: (v: number, r: ExecutionTask) => {
        if (v) return <Button type="link" size="small" onClick={() => window.open(`/report?id=${v}`, '_self')}>报告#{v}</Button>
        if (r.status === 'COMPLETED') return <Button type="link" size="small" onClick={async () => {
          const res = await generateReport(r.ruleGroupId); if (res.code === 200) { message.success('报告已生成'); fetchAll() }
        }}>生成报告</Button>
        return '-'
      }},
    { title: '耗时', dataIndex: 'durationMs', width: 80, render: (v: number) => v ? `${(v/1000).toFixed(1)}s` : '-' },
    { title: '提交时间', dataIndex: 'queuedAt', width: 160, ellipsis: true },
    { title: '操作', width: 150, fixed: 'right' as const, render: (_: unknown, r: ExecutionTask) => (
      <Space>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => showDetail(r.id)}>详情</Button>
        {(r.status === 'RUNNING' || r.status === 'QUEUED') && (
          <Popconfirm title="确认终止主任务？所有执行中的子任务都将被终止" onConfirm={() => handleCancel(r.id)} okText="确认终止" cancelText="取消" okType="danger">
            <Button type="link" size="small" danger icon={<StopOutlined />}>终止</Button>
          </Popconfirm>
        )}
      </Space>
    )},
  ]

  const subTaskColumns = [
    { title: '#', dataIndex: 'subTaskIndex', width: 50 },
    { title: '状态', dataIndex: 'status', width: 80,
      render: (v: string) => <Badge status={statusColorMap[v] as 'default'} text={statusTextMap[v] || v} /> },
    { title: '数据范围', width: 140, render: (_: unknown, r: ExecutionSubTask) => `${r.offsetStart} - ${r.offsetEnd}` },
    { title: '实际行数', dataIndex: 'rowCount', width: 90 },
    { title: '已执行规则', width: 100, render: (_: unknown, r: ExecutionSubTask) => `${r.processedRules}/${r.totalRules}` },
    { title: '异常数据', dataIndex: 'violatedCount', width: 90,
      render: (v: number) => v > 0
        ? <Button type="link" size="small" danger style={{ padding: 0 }} onClick={() => currentTask && showViolations(currentTask.id)}>{v}条</Button>
        : <span style={{ color: '#52c41a' }}>0</span> },
    { title: '线程', dataIndex: 'threadName', width: 120, ellipsis: true },
    { title: 'CPU%', dataIndex: 'cpuUsagePct', width: 70, render: (v: number) => v?.toFixed(1) || '-' },
    { title: '内存(MB)', dataIndex: 'memoryUsageMb', width: 80 },
    { title: '耗时', dataIndex: 'durationMs', width: 80, render: (v: number) => v ? `${(v/1000).toFixed(1)}s` : '-' },
    { title: '操作', width: 80, render: (_: unknown, r: ExecutionSubTask) => (
      (r.status === 'RUNNING' || r.status === 'QUEUED') && (
        <Button type="link" size="small" danger icon={<StopOutlined />} onClick={() => handleCancelSubTask(r.id)}>终止</Button>
      )
    )},
  ]

  const pools = engine?.connectionPools || {}

  return (
    <>
      <Typography.Title level={5}><CloudServerOutlined /> 任务管理中心</Typography.Title>

      {engine && (
        <Card size="small" style={{ marginBottom: 16, background: engine.overloaded ? '#fff2f0' : '#f6ffed' }}
          title={<><DashboardOutlined /> 服务节点资源监控 {engine.overloaded && <Tag color="red" icon={<WarningOutlined />}>资源过载 - 新任务将排队</Tag>}</>}
          extra={<Button size="small" icon={<ReloadOutlined />} onClick={fetchAll}>刷新</Button>}>
          <Row gutter={[16, 12]}>
            <Col span={3}><Statistic title="执行中任务" value={engine.runningTaskCount} valueStyle={{ color: engine.runningTaskCount > 0 ? '#1890ff' : undefined }} /></Col>
            <Col span={3}><Statistic title="排队任务" value={engine.queuedTaskCount} /></Col>
            <Col span={3}><Statistic title="线程池" value={engine.activeThreads} suffix={`/ ${engine.maxPoolSize}`} /></Col>
            <Col span={3}><Statistic title="CPU" value={engine.cpuUsage} suffix={`% (${engine.cpuCores}核)`} valueStyle={{ color: (engine.cpuUsage || 0) > 80 ? '#ff4d4f' : undefined }} /></Col>
            <Col span={3}><Statistic title="堆内存" value={engine.heapUsedMb} suffix={`/ ${engine.heapMaxMb} MB`} /></Col>
            <Col span={3}><Statistic title="内存%" value={engine.heapUsagePct} suffix="%" valueStyle={{ color: (engine.heapUsagePct || 0) > 80 ? '#ff4d4f' : undefined }} /></Col>
            <Col span={3}><Statistic title="磁盘" value={engine.diskUsedMb ? Math.round(engine.diskUsedMb/1024) : '-'} suffix={engine.diskTotalMb ? `/ ${Math.round(engine.diskTotalMb/1024)} GB` : ''} /></Col>
            <Col span={3}><Statistic title="磁盘%" value={engine.diskUsagePct} suffix="%" /></Col>
          </Row>
          {Object.keys(pools).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Typography.Text strong><DatabaseOutlined /> 数据库连接池：</Typography.Text>
              <Space style={{ marginLeft: 8 }}>
                {Object.entries(pools).map(([name, p]) => (
                  <Tag key={name}>{name}: 活跃{p.active}/空闲{p.idle}/总{p.total}/等待{p.waiting}</Tag>
                ))}
              </Space>
            </div>
          )}
        </Card>
      )}

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space size="large" align="center">
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { form.resetFields(); setCreateModal(true) }}>
            新建执行任务
          </Button>
          <Tag icon={<PlayCircleOutlined />}>执行中: {runningCount}</Tag>
          <Tag icon={<ClockCircleOutlined />}>排队: {queuedCount}</Tag>
          <Typography.Text type="secondary">每5秒自动刷新</Typography.Text>
        </Space>
      </Card>

      <Card title={<><PlayCircleOutlined /> 主任务列表</>} size="small">
        <Table columns={taskColumns} dataSource={tasks} rowKey="id" loading={loading} size="small"
          pagination={{ pageSize: 15 }} scroll={{ x: 1300 }} />
      </Card>

      {/* Create Task Modal */}
      <Modal title="新建执行任务" open={createModal} onCancel={() => setCreateModal(false)}
        onOk={handleSubmit} width={720} okText="提交任务" cancelText="取消" destroyOnClose>
        <Form form={form} layout="vertical"
          initialValues={{ batchSize: 10000, maxConcurrentSubTasks: 10, maxSubTaskTimeoutSec: 60 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ruleGroupId" label="规则组" rules={[{ required: true, message: '请选择规则组' }]}>
                <Select placeholder="选择规则组" showSearch optionFilterProp="label"
                  options={groups.map(g => ({ value: g.id, label: `${g.name}${g.tableName ? ' (' + g.tableName + ')' : ''}` }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dataSourceId" label="数据源（可选，覆盖规则组默认）">
                <Select placeholder="使用规则组默认数据源" allowClear showSearch optionFilterProp="label"
                  options={dataSources.map(d => ({ value: d.id, label: d.name }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tableName" label="表名（可选覆盖）">
                <Input placeholder="默认使用数据源配置的表名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="specifiedFields" label="查询字段（指定列，逗号分隔）">
                <Input placeholder="id,name,phone,create_time（不填则SELECT *）" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="primaryKeyField" label="主键字段">
                <Input placeholder="id" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="timeFilterField" label="时间过滤字段">
                <Input placeholder="create_time" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="rowLimit" label="最大数据条数">
                <InputNumber style={{ width: '100%' }} placeholder="不限制" min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="timeRangeStart" label="时间范围起">
                <DatePicker showTime style={{ width: '100%' }} placeholder="起始时间" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="timeRangeEnd" label="时间范围止">
                <DatePicker showTime style={{ width: '100%' }} placeholder="结束时间" />
              </Form.Item>
            </Col>
          </Row>
          <Collapse ghost items={[{ key: '1', label: '高级设置', children: (<>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="batchSize" label={<Tooltip title="每个子任务一次处理的数据行数">子任务批次大小</Tooltip>}>
                  <InputNumber style={{ width: '100%' }} min={100} max={100000} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="maxConcurrentSubTasks" label="最大并发子任务数">
                  <InputNumber style={{ width: '100%' }} min={1} max={50} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="maxSubTaskTimeoutSec" label="子任务超时(秒)">
                  <InputNumber style={{ width: '100%' }} min={10} max={600} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="cronExpression" label="Cron 定时表达式（可选，不填则立即执行一次）"
                  extra="格式: 秒 分 时 日 月 周，如: 0 0 2 * * ? 表示每天凌晨2点执行">
                  <Input placeholder="如: 0 0 2 * * ? (每天凌晨2点)" />
                </Form.Item>
              </Col>
            </Row>
          </>)}]} />
        </Form>
      </Modal>

      {/* Task Detail Modal */}
      <Modal title={`主任务详情 #${currentTask?.id || ''}`} open={detailModal}
        onCancel={() => setDetailModal(false)} footer={null} width={1200} destroyOnClose>
        {currentTask && (
          <>
            <Descriptions size="small" bordered column={4} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="任务ID">{currentTask.id}</Descriptions.Item>
              <Descriptions.Item label="规则组">{currentTask.ruleGroupName}</Descriptions.Item>
              <Descriptions.Item label="表名">{currentTask.tableName || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status={statusColorMap[currentTask.status] as 'default'} text={statusTextMap[currentTask.status]} />
              </Descriptions.Item>
              <Descriptions.Item label="总行数">{currentTask.totalRows?.toLocaleString() || '-'}</Descriptions.Item>
              <Descriptions.Item label="子任务数">{currentTask.completedSubTasks}/{currentTask.subTaskCount}</Descriptions.Item>
              <Descriptions.Item label="批次大小">{currentTask.batchSize || '-'}</Descriptions.Item>
              <Descriptions.Item label="并发限制">{currentTask.maxConcurrentSubTasks || '-'}</Descriptions.Item>
              <Descriptions.Item label="子任务超时">{currentTask.maxSubTaskTimeoutSec || 60}秒</Descriptions.Item>
              <Descriptions.Item label="指定字段">{currentTask.specifiedFields || 'SELECT *'}</Descriptions.Item>
              <Descriptions.Item label="来源">{currentTask.powerjobInstanceId ? `PowerJob #${currentTask.powerjobInstanceId}` : '手动创建'}</Descriptions.Item>
              <Descriptions.Item label="耗时">{currentTask.durationMs ? `${(currentTask.durationMs/1000).toFixed(1)}s` : '-'}</Descriptions.Item>
            </Descriptions>

            <Progress percent={currentTask.progress || 0}
              status={currentTask.status === 'FAILED' ? 'exception' : currentTask.status === 'RUNNING' ? 'active' : undefined}
              format={() => `${currentTask.completedSubTasks || 0}/${currentTask.subTaskCount || 0} 子任务`}
              style={{ marginBottom: 16 }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>子任务列表</Typography.Title>
              <Space>
                <Button size="small" icon={<ReloadOutlined />} onClick={refreshDetail}>刷新</Button>
                {currentTask.status === 'RUNNING' && (
                  <Space>
                    <InputNumber size="small" defaultValue={currentTask.maxSubTaskTimeoutSec || 60} min={10} max={600}
                      addonAfter="秒" style={{ width: 150 }}
                      onChange={(v) => v && handleUpdateTimeout(currentTask.id, v)} />
                    <Popconfirm title="确认终止主任务？所有执行中的子任务都将被强制终止！" onConfirm={() => { handleCancel(currentTask.id); refreshDetail() }}
                      okText="确认终止" okType="danger" cancelText="取消">
                      <Button size="small" danger icon={<StopOutlined />}>强制终止全部</Button>
                    </Popconfirm>
                  </Space>
                )}
              </Space>
            </div>

            <Table columns={subTaskColumns} dataSource={subTasks} rowKey="id" size="small"
              pagination={false} style={{ marginBottom: 16 }} />

            {steps.length > 0 && (
              <Collapse ghost items={[{ key: '1', label: <><FieldTimeOutlined /> 执行步骤日志 ({steps.length}条)</>,
                children: (
                  <Table size="small" pagination={{ pageSize: 20 }} rowKey="id" dataSource={steps} columns={[
                    { title: '步骤', dataIndex: 'stepName', width: 200, ellipsis: true },
                    { title: '规则类型', dataIndex: 'ruleType', width: 100 },
                    { title: '字段', dataIndex: 'fieldName', width: 100 },
                    { title: '总行数', dataIndex: 'totalRows', width: 80 },
                    { title: '异常数', dataIndex: 'violatedRows', width: 80,
                      render: (v: number) => <span style={{ color: v > 0 ? '#ff4d4f' : '#52c41a' }}>{v}</span> },
                    { title: '耗时(ms)', dataIndex: 'durationMs', width: 80 },
                    { title: '状态', dataIndex: 'status', width: 80 },
                  ]} />
                )
              }]} />
            )}

            {currentTask.errorMessage && (
              <Card size="small" style={{ marginTop: 16, background: '#fff2f0' }}>
                <Typography.Text type="danger"><strong>错误信息：</strong>{currentTask.errorMessage}</Typography.Text>
              </Card>
            )}
          </>
        )}
      </Modal>

      {/* Violation drill-down modal */}
      <Modal title="异常数据清单" open={violationModal} onCancel={() => setViolationModal(false)}
        footer={<Button onClick={() => setViolationModal(false)}>关闭</Button>} width={1000} destroyOnClose>
        <Table size="small" loading={violationLoading} dataSource={violations} rowKey="id"
          pagination={{ total: violationTotal, pageSize: 20, onChange: (p) => currentTask && showViolations(currentTask.id, p) }}
          columns={[
            { title: '行号', dataIndex: 'rowIndex', width: 70 },
            { title: '字段', dataIndex: 'fieldName', width: 120 },
            { title: '规则类型', dataIndex: 'ruleType', width: 120 },
            { title: '异常字段值', dataIndex: 'fieldValue', width: 150, render: (v: string) => v || '-' },
            { title: '异常原因', dataIndex: 'violationReason', ellipsis: true },
            { title: '发现时间', dataIndex: 'createdAt', width: 170 },
          ]} />
      </Modal>
    </>
  )
}
