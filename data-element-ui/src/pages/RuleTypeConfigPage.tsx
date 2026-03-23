import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, message, Typography, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { listRuleTypeConfigs, saveRuleTypeConfig, deleteRuleTypeConfig } from '../api'
import type { RuleTypeConfig } from '../types'

export default function RuleTypeConfigPage() {
  const [data, setData] = useState<RuleTypeConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | undefined>()

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

  const columns = [
    { title: '排序', dataIndex: 'sortOrder', width: 60 },
    { title: '类型编码', dataIndex: 'typeCode', width: 180 },
    { title: '类型名称', dataIndex: 'typeName', width: 150 },
    { title: '规则级别', dataIndex: 'ruleLevel', width: 90,
      render: (v: string) => v === 'TABLE' ? <Tag color="purple">表级</Tag> : <Tag color="cyan">字段级</Tag> },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '需要参数', dataIndex: 'needsParams', width: 90,
      render: (v: number) => v ? <Tag color="orange">是</Tag> : <Tag>否</Tag> },
    { title: '参数模板', dataIndex: 'paramTemplate', width: 160, ellipsis: true },
    { title: '关联字典', dataIndex: 'dictCode', width: 110,
      render: (v: string) => v ? <Tag color="purple">{v}</Tag> : '-' },
    { title: '状态', dataIndex: 'status', width: 70,
      render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    { title: '操作', width: 140, render: (_: unknown, record: RuleTypeConfig) => (
      <Space>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id!)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={5} style={{ margin: 0 }}>规则类型管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(undefined); setModalOpen(true) }}>
          新增规则类型
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="small"
        pagination={false} scroll={{ y: 600 }} />

      <Modal title={editingId ? '编辑规则类型' : '新增规则类型'} open={modalOpen}
        onOk={handleSave} onCancel={() => { setModalOpen(false); form.resetFields() }}
        width={600} destroyOnClose>
        <Form form={form} layout="vertical" size="middle">
          <Form.Item name="typeCode" label="类型编码" rules={[{ required: true }]}
            extra="如 NOT_NULL, LENGTH, PHONE 等">
            <Input placeholder="大写英文+下划线" disabled={!!editingId} />
          </Form.Item>
          <Form.Item name="typeName" label="类型名称" rules={[{ required: true }]}>
            <Input placeholder="如: 非空校验" />
          </Form.Item>
          <Form.Item name="ruleLevel" label="规则级别" initialValue="FIELD" rules={[{ required: true }]}>
            <Select options={[{ value: 'TABLE', label: '表级规则' }, { value: 'FIELD', label: '字段级规则' }]} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="规则类型描述" />
          </Form.Item>
          <Form.Item name="needsParams" label="是否需要参数" initialValue={0}>
            <Select options={[{ value: 0, label: '否' }, { value: 1, label: '是' }]} />
          </Form.Item>
          <Form.Item name="paramTemplate" label="参数模板/提示">
            <Input placeholder='如 {"min":1,"max":100}' />
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
