import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, message, Typography, Tag, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { listRuleTypeConfigs, saveRuleTypeConfig, deleteRuleTypeConfig } from '../api'
import type { RuleTypeConfig } from '../types'

const BUILTIN_TYPES = new Set([
  'NOT_NULL', 'IS_NULL', 'UNIQUE', 'LENGTH', 'REGEX', 'DATE_FORMAT', 'DATE_RANGE',
  'ID_CARD', 'PHONE', 'LANDLINE', 'FAX', 'POSTCODE', 'SOCIAL_CREDIT_CODE',
  'ENCODING_RULE', 'DOMAIN_CHECK', 'INVALID_CONTENT', 'TABLE_ROW_COUNT', 'CUSTOM_SQL', 'SCRIPT'
])

export default function RuleTypeConfigPage() {
  const [data, setData] = useState<RuleTypeConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | undefined>()
  const [descModal, setDescModal] = useState(false)
  const [descContent, setDescContent] = useState<{ title: string; desc: string }>({ title: '', desc: '' })

  const fetchData = async () => {
    setLoading(true)
    try { const res = await listRuleTypeConfigs(); setData(res.data || []) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    const values = await form.validateFields()
    await saveRuleTypeConfig({ ...values, id: editingId, status: values.status ?? 1 })
    message.success('保存成功')
    setModalOpen(false)
    form.resetFields()
    setEditingId(undefined)
    fetchData()
  }

  const handleEdit = (record: RuleTypeConfig) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    await deleteRuleTypeConfig(id)
    message.success('删除成功')
    fetchData()
  }

  const showDescription = (record: RuleTypeConfig) => {
    setDescContent({ title: `${record.typeName} (${record.typeCode})`, desc: record.description || '暂无描述' })
    setDescModal(true)
  }

  const columns = [
    { title: '排序', dataIndex: 'sortOrder', width: 50 },
    { title: '类型编码', dataIndex: 'typeCode', width: 220,
      render: (v: string) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          <Typography.Text code style={{ fontSize: 12 }}>{v}</Typography.Text>
          {' '}
          {BUILTIN_TYPES.has(v) ? <Tag color="green" style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>内置</Tag>
            : <Tag color="orange" style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>自定义</Tag>}
        </span>
      )},
    { title: '类型名称', dataIndex: 'typeName', width: 130 },
    { title: '规则级别', dataIndex: 'ruleLevel', width: 75,
      render: (v: string) => v === 'TABLE' ? <Tag color="purple">表级</Tag> : <Tag color="cyan">字段级</Tag> },
    { title: '描述（双击查看完整说明）', dataIndex: 'description', ellipsis: true,
      onCell: (record: RuleTypeConfig) => ({
        onDoubleClick: () => showDescription(record),
        style: { cursor: 'pointer' },
      }),
      render: (v: string) => {
        const first = (v || '').split('\n')[0]
        return <Typography.Text style={{ fontSize: 12 }}>{first}</Typography.Text>
      }},
    { title: '参数', dataIndex: 'needsParams', width: 55,
      render: (v: number) => v ? <Tag color="orange">需要</Tag> : <Tag>无</Tag> },
    { title: '默认参数', dataIndex: 'defaultParams', width: 130, ellipsis: true,
      render: (v: string) => v ? <Typography.Text code style={{ fontSize: 11 }}>{v}</Typography.Text> : '-' },
    { title: '状态', dataIndex: 'status', width: 55,
      render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    { title: '操作', width: 130, render: (_: unknown, record: RuleTypeConfig) => (
      <Space>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        {!BUILTIN_TYPES.has(record.typeCode) && (
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id!)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        )}
      </Space>
    )},
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Typography.Title level={5} style={{ margin: 0 }}>规则类型管理</Typography.Title>
          <Tooltip title="双击描述列查看完整说明。内置规则类型由系统初始化，不可删除。">
            <InfoCircleOutlined style={{ color: '#999' }} />
          </Tooltip>
          <Tag>{data.length} 种规则类型</Tag>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          form.resetFields(); setEditingId(undefined); setModalOpen(true)
        }}>
          新增规则类型
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="small"
        pagination={false} scroll={{ x: 1100, y: 600 }} />

      {/* Description detail modal */}
      <Modal title={descContent.title} open={descModal} onCancel={() => setDescModal(false)}
        footer={<Button onClick={() => setDescModal(false)}>关闭</Button>} width={700}>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14, lineHeight: 1.8,
          background: '#f5f5f5', padding: 16, borderRadius: 8, maxHeight: 500, overflow: 'auto' }}>
          {descContent.desc}
        </pre>
      </Modal>

      {/* Edit modal */}
      <Modal title={editingId ? '编辑规则类型' : '新增规则类型'} open={modalOpen}
        onOk={handleSave} onCancel={() => { setModalOpen(false); form.resetFields() }}
        width={640} destroyOnClose>
        <Form form={form} layout="vertical" size="middle">
          <Form.Item name="typeCode" label="类型编码" rules={[{ required: true }]}
            extra="如 NOT_NULL, LENGTH, PHONE, SCRIPT 等（大写英文+下划线）">
            <Input placeholder="大写英文+下划线" disabled={!!editingId} />
          </Form.Item>
          <Form.Item name="typeName" label="类型名称" rules={[{ required: true }]}>
            <Input placeholder="如: 非空校验、自定义Java脚本校验" />
          </Form.Item>
          <Form.Item name="ruleLevel" label="规则级别" initialValue="FIELD" rules={[{ required: true }]}>
            <Select options={[{ value: 'TABLE', label: '表级规则' }, { value: 'FIELD', label: '字段级规则' }]} />
          </Form.Item>
          <Form.Item name="description" label="描述（支持多行，包含用途、适用场景、参数说明、示例）">
            <Input.TextArea rows={6} placeholder="【用途】...\n【适用场景】...\n【参数说明】...\n【示例】..." />
          </Form.Item>
          <Form.Item name="needsParams" label="是否需要参数" initialValue={0}>
            <Select options={[{ value: 0, label: '否 — 无需额外参数' }, { value: 1, label: '是 — 规则定义时需填写参数' }]} />
          </Form.Item>
          <Form.Item name="defaultParams" label="默认参数 (JSON)">
            <Input.TextArea rows={2} placeholder='如 {"min":1,"max":100}' style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item name="paramTemplate" label="参数模板/提示 (JSON)">
            <Input.TextArea rows={2} placeholder='如 {"min":"最小长度","max":"最大长度"}' style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item name="dictCode" label="关联字典编码" extra="值域校验(DOMAIN_CHECK)等类型可关联字典表">
            <Input placeholder="如 TABLE_19" />
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
