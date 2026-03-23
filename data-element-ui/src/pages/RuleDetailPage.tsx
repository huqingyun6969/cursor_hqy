import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, message, Typography, Card, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { listRules, saveRule, deleteRule, listRuleTypes, getRuleGroup } from '../api'
import type { RuleDefinition, RuleTypeOption, RuleGroup } from '../types'

const ruleParamsHelp: Record<string, string> = {
  LENGTH: '{"min":3,"max":50} 或 {"exact":18}',
  REGEX: '{"pattern":"^[A-Z]\\\\d{9}$"}',
  DATE_FORMAT: '{"format":"yyyy-MM-dd","minDate":"1970-01-01"}',
  DOMAIN_CHECK: '{"dictCode":"TABLE_19"}',
  TABLE_ROW_COUNT: '{"minRows":0}',
  ENCODING_RULE: '{"pattern":"^[A-Z]\\\\d{9}$"}',
  INVALID_CONTENT: '{"minChineseLen":1,"minCharLen":3}',
  DATE_RANGE: '{"format":"yyyy-MM-dd","minDate":"1949-10-01"}',
  CUSTOM_SQL: '自定义SQL在下方填写',
}

export default function RuleDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const [rules, setRules] = useState<RuleDefinition[]>([])
  const [ruleTypes, setRuleTypes] = useState<RuleTypeOption[]>([])
  const [group, setGroup] = useState<RuleGroup | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | undefined>()
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('FIELD')

  const gid = Number(groupId)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rulesRes, typesRes, groupRes] = await Promise.all([listRules(gid), listRuleTypes(), getRuleGroup(gid)])
      setRules(rulesRes.data || [])
      setRuleTypes(typesRes.data || [])
      setGroup(groupRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [groupId])

  const handleSave = async () => {
    const values = await form.validateFields()
    const weight = values.importanceLevel === 'IMPORTANT' ? 3 : 1
    await saveRule({ ...values, id: editingId, ruleGroupId: gid, ruleWeight: values.ruleWeight ?? weight,
      status: values.status ?? 1, sortOrder: values.sortOrder ?? 0,
      ruleLevel: values.ruleLevel ?? 'FIELD', importanceLevel: values.importanceLevel ?? 'NORMAL' })
    message.success('保存成功')
    setModalOpen(false)
    form.resetFields()
    setEditingId(undefined)
    fetchData()
  }

  const handleEdit = (record: RuleDefinition) => {
    setEditingId(record.id)
    setSelectedType(record.ruleType)
    setSelectedLevel(record.ruleLevel || 'FIELD')
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    await deleteRule(id)
    message.success('删除成功')
    fetchData()
  }

  const typeMap = new Map(ruleTypes.map(t => [t.value, t.label]))

  const columns = [
    { title: '序号', dataIndex: 'sortOrder', width: 50 },
    { title: '规则级别', dataIndex: 'ruleLevel', width: 90,
      render: (v: string) => v === 'TABLE' ? <Tag color="purple">表级</Tag> : <Tag color="cyan">字段级</Tag> },
    { title: '字段名', dataIndex: 'fieldName', width: 140 },
    { title: '规则类型', dataIndex: 'ruleType', width: 130,
      render: (v: string) => <Tag color="blue">{typeMap.get(v) || v}</Tag> },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '重要程度', dataIndex: 'importanceLevel', width: 90,
      render: (v: string) => v === 'IMPORTANT' ? <Tag color="red">重要</Tag> : <Tag>一般</Tag> },
    { title: '权重', dataIndex: 'ruleWeight', width: 60 },
    { title: '自定义SQL', dataIndex: 'customSql', width: 100, ellipsis: true,
      render: (v: string) => v ? <Tag color="orange">有</Tag> : '-' },
    { title: '状态', dataIndex: 'status', width: 60,
      render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    { title: '操作', width: 140, render: (_: unknown, record: RuleDefinition) => (
      <Space>
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id!)}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/rule-group')}>返回</Button>
        <Typography.Title level={5} style={{ margin: 0 }}>
          规则组: {group?.name || groupId} - 规则配置
        </Typography.Title>
      </Space>
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>共 {rules.length} 条规则</span>
          <Button type="primary" icon={<PlusOutlined />}
            onClick={() => { form.resetFields(); setEditingId(undefined); setSelectedType(''); setSelectedLevel('FIELD'); setModalOpen(true) }}>
            新增规则
          </Button>
        </div>
      </Card>
      <Table columns={columns} dataSource={rules} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 20 }} />

      <Modal title={editingId ? '编辑规则' : '新增规则'} open={modalOpen}
        onOk={handleSave} onCancel={() => { setModalOpen(false); form.resetFields() }}
        width={720} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="ruleLevel" label="规则级别" initialValue="FIELD" rules={[{ required: true }]}>
            <Select onChange={(v) => setSelectedLevel(v)} options={[
              { value: 'TABLE', label: '表级规则' },
              { value: 'FIELD', label: '字段级规则' },
            ]} />
          </Form.Item>
          <Form.Item name="fieldName" label={selectedLevel === 'TABLE' ? '表名/标识' : '字段名'} rules={[{ required: true }]}>
            <Input placeholder={selectedLevel === 'TABLE' ? '表标识，如 /' : '数据库字段名称，如 CORPNAME'} />
          </Form.Item>
          <Form.Item name="ruleType" label="规则类型" rules={[{ required: true }]}>
            <Select placeholder="选择规则类型"
              options={ruleTypes.map(t => ({ value: t.value, label: `${t.label} (${t.value})` }))}
              onChange={(v) => setSelectedType(v)} />
          </Form.Item>
          <Form.Item name="description" label="规则描述">
            <Input.TextArea placeholder="例: CORPNAME重复率=0%" rows={2} />
          </Form.Item>
          <Form.Item name="ruleParams" label={
            <span>规则参数 (JSON)
              {selectedType && ruleParamsHelp[selectedType] && <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                提示: {ruleParamsHelp[selectedType]}
              </Typography.Text>}
            </span>
          }>
            <Input.TextArea placeholder='例如: {"min":3,"max":50}' rows={2} />
          </Form.Item>
          <Form.Item name="customSql" label="自定义SQL（可选，直接执行此SQL进行校验）">
            <Input.TextArea placeholder={'SELECT COUNT(*) FROM table WHERE ...\n或\nSELECT ROUND((COUNT(*) - COUNT(DISTINCT ID)) / COUNT(*) * 100, 2) AS result FROM table'} rows={4} />
          </Form.Item>
          <Form.Item name="importanceLevel" label="重要程度" initialValue="NORMAL">
            <Select onChange={(v) => { form.setFieldsValue({ ruleWeight: v === 'IMPORTANT' ? 3 : 1 }) }}
              options={[
                { value: 'IMPORTANT', label: '重要 (权重默认3)' },
                { value: 'NORMAL', label: '一般 (权重默认1)' },
              ]} />
          </Form.Item>
          <Form.Item name="ruleWeight" label="权重" initialValue={1}>
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序号" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
