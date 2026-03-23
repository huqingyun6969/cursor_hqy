import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Typography, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { listRuleGroups, saveRuleGroup, deleteRuleGroup } from '../api'
import type { RuleGroup } from '../types'

export default function RuleGroupPage() {
  const [data, setData] = useState<RuleGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | undefined>()
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try { const res = await listRuleGroups(); setData(res.data || []) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    const values = await form.validateFields()
    await saveRuleGroup({ ...values, id: editingId, status: values.status ?? 1 })
    message.success('保存成功'); setModalOpen(false); form.resetFields(); setEditingId(undefined); fetchData()
  }

  const handleEdit = (r: RuleGroup) => { setEditingId(r.id); form.setFieldsValue(r); setModalOpen(true) }
  const handleDelete = async (id: number) => { await deleteRuleGroup(id); message.success('已删除'); fetchData() }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '数据标准名称', dataIndex: 'name', width: 200 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 70,
      render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    { title: '操作', width: 250, render: (_: unknown, r: RuleGroup) => (
      <Space>
        <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => navigate(`/rule-group/${r.id}/rules`)}>
          关联规则
        </Button>
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
        <Typography.Title level={5}>数据标准管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(undefined); setModalOpen(true) }}>
          新增数据标准
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="small" />

      <Modal title={editingId ? '编辑数据标准' : '新增数据标准'} open={modalOpen}
        onOk={handleSave} onCancel={() => { setModalOpen(false); form.resetFields() }} width={500} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="数据标准名称" rules={[{ required: true }]}>
            <Input placeholder="如: 手机号校验标准、用户信息完整性标准" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="描述此数据标准的用途和适用范围" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
