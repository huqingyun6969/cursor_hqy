import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Typography, Card, Tag, Timeline, message, Descriptions } from 'antd'
import { PlusOutlined, FileSearchOutlined } from '@ant-design/icons'
import { listWorkOrders, getWorkOrder, createWorkOrder, workOrderAction, listReports } from '../api'
import type { WorkOrder, WorkOrderVO, QualityReport } from '../types'

const statusMap: Record<string, { text: string; color: string }> = {
  PENDING: { text: '待处理', color: 'orange' },
  PROCESSING: { text: '整改中', color: 'blue' },
  REJECTED: { text: '打回修改', color: 'red' },
  COMPLETED: { text: '已完成', color: 'green' },
}

const actionMap: Record<string, string> = {
  CREATE: '系统生成（发起）',
  SUBMIT: '提交整改',
  REJECT: '打回修改',
  APPROVE: '审核通过',
  RESUBMIT: '再次提交整改',
}

const urgencyOptions = [
  { value: 'HIGH', label: '高' },
  { value: 'NORMAL', label: '中' },
  { value: 'LOW', label: '低' },
]

export default function WorkOrderPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [actionModal, setActionModal] = useState(false)
  const [detail, setDetail] = useState<WorkOrderVO | null>(null)
  const [reports, setReports] = useState<QualityReport[]>([])
  const [form] = Form.useForm()
  const [actionForm] = Form.useForm()
  const [currentOrderId, setCurrentOrderId] = useState<number>(0)

  const fetchOrders = async () => {
    setLoading(true)
    try { const res = await listWorkOrders(); setOrders(res.data || []) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [])

  const showCreate = async () => {
    const res = await listReports()
    setReports(res.data || [])
    form.resetFields()
    setCreateModal(true)
  }

  const handleCreate = async () => {
    const values = await form.validateFields()
    const res = await createWorkOrder(values)
    if (res.code === 200) {
      message.success('工单创建成功')
      setCreateModal(false)
      fetchOrders()
    } else { message.error(res.message) }
  }

  const showDetail = async (orderId: number) => {
    const res = await getWorkOrder(orderId)
    if (res.code === 200) { setDetail(res.data); setDetailModal(true) }
  }

  const showAction = (orderId: number) => {
    setCurrentOrderId(orderId)
    actionForm.resetFields()
    setActionModal(true)
  }

  const handleAction = async () => {
    const values = await actionForm.validateFields()
    await workOrderAction(currentOrderId, values)
    message.success('操作成功')
    setActionModal(false)
    fetchOrders()
    if (detail && detail.id === currentOrderId) {
      showDetail(currentOrderId)
    }
  }

  const columns = [
    { title: '工单编号', dataIndex: 'orderNo', width: 180 },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 100,
      render: (v: string) => { const s = statusMap[v]; return s ? <Tag color={s.color}>{s.text}</Tag> : v }},
    { title: '紧急程度', dataIndex: 'urgency', width: 90,
      render: (v: string) => v === 'HIGH' ? <Tag color="red">高</Tag> : v === 'LOW' ? <Tag>低</Tag> : <Tag color="blue">中</Tag> },
    { title: '表名', dataIndex: 'tableName', width: 180 },
    { title: '创建时间', dataIndex: 'createdAt', width: 180 },
    { title: '操作', width: 200, render: (_: unknown, record: WorkOrder) => (
      <Space>
        <Button type="link" icon={<FileSearchOutlined />} onClick={() => showDetail(record.id)}>详情</Button>
        {record.status !== 'COMPLETED' && (
          <Button type="link" onClick={() => showAction(record.id)}>处理</Button>
        )}
      </Space>
    )},
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={5}>数据质量问题处置工单</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showCreate}>创建工单</Button>
      </div>

      <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} size="middle" />

      {/* Create Modal */}
      <Modal title="创建数据质量问题处置工单" open={createModal} onOk={handleCreate}
        onCancel={() => setCreateModal(false)} width={640} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="reportId" label="关联质量报告">
            <Select placeholder="选择质量报告（可选）" allowClear
              options={reports.map(r => ({ value: r.id, label: `${r.tableName} (${r.totalScore}分) - ${r.createdAt}` }))} />
          </Form.Item>
          <Form.Item name="title" label="工单标题" rules={[{ required: true }]}>
            <Input placeholder="例: 企业登记信息表质量整改" />
          </Form.Item>
          <Form.Item name="urgency" label="紧急程度" initialValue="NORMAL">
            <Select options={urgencyOptions} />
          </Form.Item>
          <Form.Item name="dataSourceUnit" label="数据来源单位">
            <Input placeholder="例: 厅基本建设处" />
          </Form.Item>
          <Form.Item name="issueDescription" label="质量问题简述">
            <Input.TextArea rows={3} placeholder="数据重复或空值等问题" />
          </Form.Item>
          <Form.Item name="issueImpact" label="问题影响">
            <Input.TextArea rows={2} placeholder="在机器替招投标中，获取交通厅的相关企业信息..." />
          </Form.Item>
          <Form.Item name="suggestion" label="处置建议">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="assignee" label="处理人">
            <Input placeholder="整改负责人" />
          </Form.Item>
          <Form.Item name="createdBy" label="创建人">
            <Input placeholder="发起人" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal title="数据质量问题处置工单" open={detailModal} onCancel={() => setDetailModal(false)}
        footer={null} width={1100} destroyOnClose>
        {detail && (
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <Card size="small" title="工单基本信息"
                extra={detail.status !== 'COMPLETED' ? <Tag color="orange">整改处理中</Tag> : <Tag color="green">已完成</Tag>}
                style={{ marginBottom: 16, background: '#fffbe6', border: '1px solid #ffe58f' }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="工单编号">{detail.orderNo}</Descriptions.Item>
                  <Descriptions.Item label="工单标题">{detail.title}</Descriptions.Item>
                  <Descriptions.Item label="工单状态">
                    {(() => { const s = statusMap[detail.status]; return s ? <Tag color={s.color}>{s.text}</Tag> : detail.status })()}
                  </Descriptions.Item>
                  <Descriptions.Item label="紧急程度">{detail.urgency}</Descriptions.Item>
                  <Descriptions.Item label="数据来源单位">{detail.dataSourceUnit}</Descriptions.Item>
                  <Descriptions.Item label="表名">{detail.tableName}</Descriptions.Item>
                  <Descriptions.Item label="创建人">{detail.createdBy}</Descriptions.Item>
                  <Descriptions.Item label="处理人">{detail.assignee}</Descriptions.Item>
                </Descriptions>
                {detail.issueDescription && (
                  <div style={{ marginTop: 8 }}>
                    <strong>质量问题简述：</strong>{detail.issueDescription}
                  </div>
                )}
                {detail.issueImpact && (
                  <div style={{ marginTop: 4 }}>
                    <strong>问题影响：</strong>{detail.issueImpact}
                  </div>
                )}
                {detail.suggestion && (
                  <div style={{ marginTop: 4 }}>
                    <strong>处置建议：</strong>{detail.suggestion}
                  </div>
                )}
              </Card>

              {detail.issues && detail.issues.length > 0 && (
                <Card size="small" title="数据问题清单" style={{ marginBottom: 16 }}>
                  <Table size="small" pagination={false} dataSource={detail.issues} rowKey="id"
                    columns={[
                      { title: '字段名称', dataIndex: 'fieldName', width: 120 },
                      { title: '字段编码', dataIndex: 'fieldCode', width: 120 },
                      { title: '问题类型', dataIndex: 'issueType', width: 100 },
                      { title: '不符合规则', dataIndex: 'ruleDescription', ellipsis: true },
                      { title: '问题数据条数', dataIndex: 'issueCount', width: 120 },
                    ]} />
                </Card>
              )}
            </div>

            <div style={{ width: 300, flexShrink: 0 }}>
              <Card size="small" title="整改流程进度">
                <Timeline items={detail.logs?.map(log => ({
                  color: log.action === 'REJECT' ? 'red' : log.action === 'APPROVE' ? 'green' : 'blue',
                  children: (
                    <div>
                      <div style={{ fontSize: 12, color: '#999' }}>{log.createdAt}</div>
                      <div><strong>{log.operatorDept}（{log.operator}）</strong></div>
                      <div>{actionMap[log.action] || log.action}</div>
                      {log.comment && <div style={{ background: log.action === 'REJECT' ? '#fff2f0' : '#f6ffed',
                        padding: '4px 8px', borderRadius: 4, marginTop: 4, fontSize: 12 }}>{log.comment}</div>}
                    </div>
                  ),
                }))} />
              </Card>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal title="处理工单" open={actionModal} onOk={handleAction}
        onCancel={() => setActionModal(false)} width={500} destroyOnClose>
        <Form form={actionForm} layout="vertical">
          <Form.Item name="action" label="操作" rules={[{ required: true }]}>
            <Select options={[
              { value: 'SUBMIT', label: '提交整改' },
              { value: 'REJECT', label: '打回修改' },
              { value: 'APPROVE', label: '审核通过' },
              { value: 'RESUBMIT', label: '再次提交' },
            ]} />
          </Form.Item>
          <Form.Item name="operator" label="操作人" rules={[{ required: true }]}>
            <Input placeholder="操作人姓名" />
          </Form.Item>
          <Form.Item name="operatorDept" label="部门">
            <Input placeholder="部门名称" />
          </Form.Item>
          <Form.Item name="comment" label="备注">
            <Input.TextArea rows={3} placeholder="处理意见" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
