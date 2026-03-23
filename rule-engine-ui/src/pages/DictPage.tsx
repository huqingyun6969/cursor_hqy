import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Space, message, Typography, Card } from 'antd'
import { PlusOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { listDicts, saveDict, getDictItems, saveDictItems } from '../api'
import type { DictTable, DictItem } from '../types'

export default function DictPage() {
  const [dicts, setDicts] = useState<DictTable[]>([])
  const [loading, setLoading] = useState(false)
  const [dictModal, setDictModal] = useState(false)
  const [form] = Form.useForm()

  const [itemsModal, setItemsModal] = useState(false)
  const [currentDict, setCurrentDict] = useState<string>('')
  const [items, setItems] = useState<DictItem[]>([])
  const [newItemValue, setNewItemValue] = useState('')
  const [newItemLabel, setNewItemLabel] = useState('')

  const fetchDicts = async () => {
    setLoading(true)
    try {
      const res = await listDicts()
      setDicts(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDicts() }, [])

  const handleSaveDict = async () => {
    const values = await form.validateFields()
    await saveDict(values)
    message.success('保存成功')
    setDictModal(false)
    form.resetFields()
    fetchDicts()
  }

  const handleShowItems = async (dictCode: string) => {
    setCurrentDict(dictCode)
    const res = await getDictItems(dictCode)
    setItems(res.data || [])
    setItemsModal(true)
  }

  const handleAddItem = () => {
    if (!newItemValue.trim()) { message.warning('请输入值'); return }
    setItems([...items, {
      dictCode: currentDict,
      itemValue: newItemValue.trim(),
      itemLabel: newItemLabel.trim() || newItemValue.trim(),
      sortOrder: items.length,
    }])
    setNewItemValue('')
    setNewItemLabel('')
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSaveItems = async () => {
    await saveDictItems(currentDict, items)
    message.success('保存成功')
    setItemsModal(false)
  }

  const dictColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '字典编码', dataIndex: 'dictCode', width: 200 },
    { title: '字典名称', dataIndex: 'dictName', width: 300 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '操作', width: 200,
      render: (_: unknown, record: DictTable) => (
        <Space>
          <Button type="link" icon={<UnorderedListOutlined />} onClick={() => handleShowItems(record.dictCode)}>
            管理字典项
          </Button>
        </Space>
      ),
    },
  ]

  const itemColumns = [
    { title: '序号', dataIndex: 'sortOrder', width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: '值', dataIndex: 'itemValue', width: 200 },
    { title: '标签', dataIndex: 'itemLabel', width: 200 },
    {
      title: '操作', width: 80,
      render: (_: unknown, __: unknown, index: number) => (
        <Button type="link" danger onClick={() => handleRemoveItem(index)}>删除</Button>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={5}>字典管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setDictModal(true) }}>
          新增字典
        </Button>
      </div>
      <Table columns={dictColumns} dataSource={dicts} rowKey="id" loading={loading} size="middle" />

      <Modal title="新增字典" open={dictModal}
        onOk={handleSaveDict} onCancel={() => { setDictModal(false); form.resetFields() }}
        width={500} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="dictCode" label="字典编码" rules={[{ required: true }]}>
            <Input placeholder="例如: TABLE_19" />
          </Form.Item>
          <Form.Item name="dictName" label="字典名称" rules={[{ required: true }]}>
            <Input placeholder="字典名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="描述" rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`字典项管理 - ${currentDict}`} open={itemsModal}
        onOk={handleSaveItems} onCancel={() => setItemsModal(false)}
        width={700} destroyOnClose>
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space>
            <Input placeholder="值" value={newItemValue} onChange={e => setNewItemValue(e.target.value)} style={{ width: 200 }} />
            <Input placeholder="标签（可选）" value={newItemLabel} onChange={e => setNewItemLabel(e.target.value)} style={{ width: 200 }} />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>添加</Button>
          </Space>
        </Card>
        <Table columns={itemColumns} dataSource={items} rowKey={(_, i) => String(i)} size="small"
          pagination={{ pageSize: 20 }} />
        <Typography.Text type="secondary">共 {items.length} 项</Typography.Text>
      </Modal>
    </>
  )
}
