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
  DATE_RANGE: '{"format":"yyyy-MM-dd","minDate":"1949-10-01","compareField":"start_date"}',
  SOCIAL_CREDIT_CODE: '无需参数',
  ID_CARD: '无需参数',
  PHONE: '无需参数',
  FAX: '无需参数',
  POSTCODE: '无需参数',
  LANDLINE: '无需参数',
  NOT_NULL: '无需参数',
  UNIQUE: '无需参数',
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

  const gid = Number(groupId)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rulesRes, typesRes, groupRes] = await Promise.all([
        listRules(gid),
        listRuleTypes(),
        getRuleGroup(gid),
      ])
      setRules(rulesRes.data || [])
      setRuleTypes(typesRes.data || [])
      setGroup(groupRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [groupId])

  const handleSave = async () => {
    const values = await form.validateFields()
    await saveRule({ ...values, id: editingId, ruleGroupId: gid, status: values.status ?? 1, sortOrder: values.sortOrder ?? 0 })
    message.success('保存成功')
    setModalOpen(false)
    form.resetFields()
    setEditingId(undefined)
    fetchData()
  }

  const handleEdit = (record: RuleDefinition) => {
    setEditingId(record.id)
    setSelectedType(record.ruleType)
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
    { title: '序号', dataIndex: 'sortOrder', width: 60 },
    { title: '字段名', dataIndex: 'fieldName', width: 160 },
    { title: '规则类型', dataIndex: 'ruleType', width: 160,
      render: (v: string) => <Tag color="blue">{typeMap.get(v) || v}</Tag> },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '参数', dataIndex: 'ruleParams', width: 200, ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 70,
      render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    {
      title: '操作', width: 160,
      render: (_: unknown, record: RuleDefinition) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id!)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
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
            onClick={() => { form.resetFields(); setEditingId(undefined); setSelectedType(''); setModalOpen(true) }}>
            新增规则
          </Button>
        </div>
      </Card>
      <Table columns={columns} dataSource={rules} rowKey="id" loading={loading} size="middle"
        pagination={{ pageSize: 20 }} />

      <Modal title={editingId ? '编辑规则' : '新增规则'} open={modalOpen}
        onOk={handleSave} onCancel={() => { setModalOpen(false); form.resetFields() }}
        width={640} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="fieldName" label="字段名" rules={[{ required: true }]}>
            <Input placeholder="数据库字段名称" />
          </Form.Item>
          <Form.Item name="ruleType" label="规则类型" rules={[{ required: true }]}>
            <Select placeholder="选择规则类型"
              options={ruleTypes.map(t => ({ value: t.value, label: `${t.label} (${t.value})` }))}
              onChange={(v) => setSelectedType(v)} />
          </Form.Item>
          <Form.Item name="ruleParams" label={
            <span>规则参数 (JSON)
              {selectedType && <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                提示: {ruleParamsHelp[selectedType] || '无'}
              </Typography.Text>}
            </span>
          }>
            <Input.TextArea placeholder='例如: {"min":3,"max":50}' rows={3} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="规则描述" rows={2} />
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
