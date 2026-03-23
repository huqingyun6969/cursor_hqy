import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Typography, Tag, Card, Divider } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined, DatabaseOutlined } from '@ant-design/icons'
import { listMetadata, saveMetadata, deleteMetadata, listDataSources, listRuleGroups, listMetadataStandards, saveMetadataStandard, deleteMetadataStandard } from '../api'
import type { MetadataConfig, DataSourceConfig, RuleGroup, MetadataStandard } from '../types'

export default function MetadataPage() {
  const [data, setData] = useState<MetadataConfig[]>([])
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([])
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | undefined>()
  const [standardModal, setStandardModal] = useState(false)
  const [currentMetadata, setCurrentMetadata] = useState<MetadataConfig | null>(null)
  const [standards, setStandards] = useState<MetadataStandard[]>([])
  const [stdForm] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [metaRes, dsRes, grpRes] = await Promise.all([listMetadata(), listDataSources(), listRuleGroups()])
      setData(metaRes.data || [])
      setDataSources(dsRes.data || [])
      setRuleGroups(grpRes.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    const values = await form.validateFields()
    await saveMetadata({ ...values, id: editingId, status: values.status ?? 1 })
    message.success('保存成功')
    setModalOpen(false); form.resetFields(); setEditingId(undefined)
    fetchData()
  }

  const handleEdit = (r: MetadataConfig) => { setEditingId(r.id); form.setFieldsValue(r); setModalOpen(true) }
  const handleDelete = async (id: number) => { await deleteMetadata(id); message.success('已删除'); fetchData() }

  const showStandards = async (meta: MetadataConfig) => {
    setCurrentMetadata(meta)
    const res = await listMetadataStandards(meta.id!)
    setStandards(res.data || [])
    setStandardModal(true)
  }

  const handleSaveStandard = async () => {
    const values = await stdForm.validateFields()
    await saveMetadataStandard({ ...values, metadataId: currentMetadata!.id })
    message.success('数据标准已关联')
    stdForm.resetFields()
    const res = await listMetadataStandards(currentMetadata!.id!)
    setStandards(res.data || [])
  }

  const handleDeleteStandard = async (id: number) => {
    await deleteMetadataStandard(id)
    message.success('已取消关联')
    const res = await listMetadataStandards(currentMetadata!.id!)
    setStandards(res.data || [])
  }

  const dsMap = new Map(dataSources.map(d => [d.id, d.name]))
  const grpMap = new Map(ruleGroups.map(g => [g.id, g.name]))

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '元数据名称', dataIndex: 'name', width: 150 },
    { title: '校验表名', dataIndex: 'tableName', width: 150, render: (v: string) => <Tag>{v}</Tag> },
    { title: '表中文名', dataIndex: 'tableLabel', width: 120 },
    { title: '查询字段', dataIndex: 'specifiedFields', width: 150, ellipsis: true,
      render: (v: string) => v ? <Typography.Text code style={{ fontSize: 11 }}>{v}</Typography.Text> : <Tag>SELECT *</Tag> },
    { title: '数据源', dataIndex: 'dataSourceId', width: 100, render: (v: number) => dsMap.get(v) || v },
    { title: '状态', dataIndex: 'status', width: 60, render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    { title: '操作', width: 240, render: (_: unknown, r: MetadataConfig) => (
      <Space>
        <Button type="link" size="small" icon={<LinkOutlined />} onClick={() => showStandards(r)}>配置数据标准</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id!)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={5}><DatabaseOutlined /> 元数据管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(undefined); setModalOpen(true) }}>
          新增元数据
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="small" />

      {/* Edit metadata modal */}
      <Modal title={editingId ? '编辑元数据' : '新增元数据'} open={modalOpen}
        onOk={handleSave} onCancel={() => { setModalOpen(false); form.resetFields() }} width={620} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="元数据名称" rules={[{ required: true }]}>
            <Input placeholder="如: 用户表元数据" />
          </Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="dataSourceId" label="数据源" rules={[{ required: true }]}>
            <Select placeholder="选择数据源" options={dataSources.map(d => ({ value: d.id, label: d.name }))} />
          </Form.Item>
          <Form.Item name="tableName" label="校验目标表名" rules={[{ required: true }]}>
            <Input placeholder="如 bfm_user" />
          </Form.Item>
          <Form.Item name="tableLabel" label="表中文名称"><Input placeholder="如 用户表" /></Form.Item>
          <Form.Item name="specifiedFields" label="查询字段（逗号分隔，不填则SELECT *）"
            extra="建议指定需要校验的字段以提升性能">
            <Input placeholder="如: id,name,phone,id_card,create_time" />
          </Form.Item>
          <Form.Item name="querySql" label="自定义查询SQL（可选，优先于表名）">
            <Input.TextArea rows={3} placeholder="SELECT id,name FROM bfm_user WHERE status=1" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Data standards linking modal */}
      <Modal title={`${currentMetadata?.name || ''} - 配置数据标准`} open={standardModal}
        onCancel={() => setStandardModal(false)} footer={null} width={700} destroyOnClose>
        {currentMetadata && (
          <>
            <Card size="small" style={{ marginBottom: 16, background: '#f0f5ff' }}>
              <Space>
                <Tag color="blue">{currentMetadata.tableName}</Tag>
                <span>{currentMetadata.tableLabel}</span>
                <Typography.Text type="secondary">数据源: {dsMap.get(currentMetadata.dataSourceId)}</Typography.Text>
              </Space>
            </Card>
            <Typography.Title level={5}>已关联的数据标准</Typography.Title>
            <Table size="small" dataSource={standards} rowKey="id" pagination={false}
              columns={[
                { title: '数据标准', dataIndex: 'ruleGroupId', render: (v: number) => <Tag color="blue">{grpMap.get(v) || v}</Tag> },
                { title: '关联字段', dataIndex: 'fieldName', render: (v: string) => v || <Tag>全表</Tag> },
                { title: '说明', dataIndex: 'description', ellipsis: true },
                { title: '操作', width: 80, render: (_: unknown, r: MetadataStandard) => (
                  <Popconfirm title="取消关联？" onConfirm={() => handleDeleteStandard(r.id!)}>
                    <Button type="link" size="small" danger>取消关联</Button>
                  </Popconfirm>
                )},
              ]} />
            <Divider />
            <Typography.Title level={5}>关联新的数据标准</Typography.Title>
            <Form form={stdForm} layout="inline" onFinish={handleSaveStandard}>
              <Form.Item name="ruleGroupId" rules={[{ required: true, message: '选择数据标准' }]} style={{ width: 200 }}>
                <Select placeholder="选择数据标准" options={ruleGroups.map(g => ({ value: g.id, label: g.name }))} />
              </Form.Item>
              <Form.Item name="fieldName" style={{ width: 150 }}>
                <Input placeholder="关联字段(可选)" />
              </Form.Item>
              <Form.Item name="description" style={{ width: 150 }}>
                <Input placeholder="说明(可选)" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<LinkOutlined />}>关联</Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </>
  )
}
