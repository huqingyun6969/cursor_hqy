import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Typography, Tag } from 'antd'
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
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '名称', dataIndex: 'name', width: 160 },
    { title: '校验表名', dataIndex: 'tableName', width: 160 },
    { title: '表中文名', dataIndex: 'tableLabel', width: 140 },
    { title: '查询字段', dataIndex: 'specifiedFields', width: 160, ellipsis: true,
      render: (v: string) => v ? <Typography.Text code style={{ fontSize: 11 }}>{v}</Typography.Text> : <Tag>SELECT *</Tag> },
    { title: '数据源', dataIndex: 'dataSourceId', width: 120,
      render: (v: number) => dsMap.get(v) || v },
    { title: '状态', dataIndex: 'status', width: 60,
      render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    {
      title: '操作', width: 220,
      render: (_: unknown, record: RuleGroup) => (
        <Space>
          <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => navigate(`/rule-group/${record.id}/rules`)}>
            配置规则
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id!)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
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
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="small" />

      <Modal title={editingId ? '编辑规则组' : '新增规则组'} open={modalOpen}
        onOk={handleSave} onCancel={() => { setModalOpen(false); form.resetFields() }}
        width={620} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="规则组名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="描述" rows={2} />
          </Form.Item>
          <Form.Item name="dataSourceId" label="数据源" rules={[{ required: true, message: '请选择数据源' }]}>
            <Select placeholder="选择数据源" showSearch optionFilterProp="label"
              options={dataSources.map(d => ({ value: d.id, label: d.name }))} />
          </Form.Item>
          <Form.Item name="tableName" label="校验目标表名" rules={[{ required: true, message: '请输入目标表名' }]}>
            <Input placeholder="如 bfm_user, ODS_SLXY_QYJCXX" />
          </Form.Item>
          <Form.Item name="tableLabel" label="表中文名称">
            <Input placeholder="如 用户表, 企业基础信息表" />
          </Form.Item>
          <Form.Item name="specifiedFields" label="查询字段（指定列，逗号分隔）"
            extra="不填则默认 SELECT *，建议指定需要校验的字段以提升性能">
            <Input placeholder="如: id,name,phone,id_card,create_time" />
          </Form.Item>
          <Form.Item name="querySql" label="自定义查询SQL（可选，优先于表名）"
            extra="填写后将忽略表名和查询字段配置，直接执行此SQL获取数据">
            <Input.TextArea placeholder="如: SELECT id,name,phone FROM bfm_user WHERE status=1" rows={3}
              style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
