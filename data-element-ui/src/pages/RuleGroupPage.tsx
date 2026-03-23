import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { listRuleGroups, saveRuleGroup, deleteRuleGroup, listDataSources } from '../api'
import type { RuleGroup, DataSourceConfig } from '../types'

export default function RuleGroupPage() {
  const [data, setData] = useState<RuleGroup[]>([])
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | undefined>()
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [groupRes, dsRes] = await Promise.all([listRuleGroups(), listDataSources()])
      setData(groupRes.data || [])
      setDataSources(dsRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    const values = await form.validateFields()
    await saveRuleGroup({ ...values, id: editingId, status: values.status ?? 1 })
    message.success('保存成功')
    setModalOpen(false)
    form.resetFields()
    setEditingId(undefined)
    fetchData()
  }

  const handleEdit = (record: RuleGroup) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    await deleteRuleGroup(id)
    message.success('删除成功')
    fetchData()
  }

  const dsMap = new Map(dataSources.map(d => [d.id, d.name]))

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', width: 200 },
    { title: '数据源', dataIndex: 'dataSourceId', width: 180,
      render: (v: number) => dsMap.get(v) || v },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 80,
      render: (v: number) => v === 1 ? '启用' : '禁用' },
    {
      title: '操作', width: 240,
      render: (_: unknown, record: RuleGroup) => (
        <Space>
          <Button type="link" icon={<SettingOutlined />} onClick={() => navigate(`/rule-group/${record.id}/rules`)}>
            配置规则
          </Button>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={5}>规则组管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(undefined); setModalOpen(true) }}>
          新增规则组
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="middle" />

      <Modal title={editingId ? '编辑规则组' : '新增规则组'} open={modalOpen}
        onOk={handleSave} onCancel={() => { setModalOpen(false); form.resetFields() }}
        width={560} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="规则组名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="描述" rows={2} />
          </Form.Item>
          <Form.Item name="dataSourceId" label="数据源" rules={[{ required: true, message: '请选择数据源' }]}>
            <Select placeholder="选择数据源"
              options={dataSources.map(d => ({ value: d.id, label: d.name }))} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
