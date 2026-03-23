import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Typography, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined } from '@ant-design/icons'
import { listDataSources, saveDataSource, deleteDataSource, testDataSource } from '../api'
import type { DataSourceConfig, DbType } from '../types'

const dbTypeOptions: { value: DbType; label: string; color: string }[] = [
  { value: 'MYSQL', label: 'MySQL', color: 'blue' },
  { value: 'ORACLE', label: 'Oracle', color: 'orange' },
  { value: 'HIVE', label: 'Hive', color: 'green' },
]

const jdbcUrlPlaceholders: Record<DbType, string> = {
  MYSQL: 'jdbc:mysql://127.0.0.1:33306/zsmartcity_auth?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false',
  ORACLE: 'jdbc:oracle:thin:@//host:1521/service_name',
  HIVE: 'jdbc:hive2://host:10000/database',
}

export default function DataSourcePage() {
  const [data, setData] = useState<DataSourceConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | undefined>()
  const [selectedDbType, setSelectedDbType] = useState<DbType>('MYSQL')
  const [testing, setTesting] = useState(false)

  const handleTestConnection = async () => {
    try {
      const values = await form.validateFields(['dbUrl', 'dbUsername', 'dbPassword'])
      setTesting(true)
      const res = await testDataSource(values)
      if (res.code === 200) { message.success(res.data || '连接成功') }
      else { message.error(res.message || '连接失败') }
    } catch (e: any) {
      message.error(e?.response?.data?.message || '连接测试失败')
    } finally { setTesting(false) }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await listDataSources()
      setData(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    const values = await form.validateFields()
    await saveDataSource({ ...values, id: editingId, status: values.status ?? 1 })
    message.success('保存成功')
    setModalOpen(false)
    form.resetFields()
    setEditingId(undefined)
    fetchData()
  }

  const handleEdit = (record: DataSourceConfig) => {
    setEditingId(record.id)
    setSelectedDbType(record.dbType || 'MYSQL')
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    await deleteDataSource(id)
    message.success('删除成功')
    fetchData()
  }

  const handleDbTypeChange = (value: DbType) => {
    setSelectedDbType(value)
    form.setFieldsValue({ dbUrl: jdbcUrlPlaceholders[value] })
  }

  const dbTypeColorMap: Record<string, string> = { MYSQL: 'blue', ORACLE: 'orange', HIVE: 'green' }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', width: 160 },
    { title: '数据库类型', dataIndex: 'dbType', width: 110,
      render: (v: string) => <Tag color={dbTypeColorMap[v] || 'default'}>{v || 'MYSQL'}</Tag> },
    { title: '表名', dataIndex: 'tableName', width: 160 },
    { title: 'JDBC URL', dataIndex: 'dbUrl', ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 80,
      render: (v: number) => v === 1 ? '启用' : '禁用' },
    {
      title: '操作', width: 160,
      render: (_: unknown, record: DataSourceConfig) => (
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={5}>数据源管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          form.resetFields()
          setEditingId(undefined)
          setSelectedDbType('MYSQL')
          form.setFieldsValue({ dbType: 'MYSQL', dbUrl: jdbcUrlPlaceholders['MYSQL'] })
          setModalOpen(true)
        }}>
          新增数据源
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="middle" />

      <Modal title={editingId ? '编辑数据源' : '新增数据源'} open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        width={680} destroyOnClose
        footer={[
          <Button key="test" icon={<ApiOutlined />} loading={testing} onClick={handleTestConnection}>测试连接</Button>,
          <Button key="cancel" onClick={() => { setModalOpen(false); form.resetFields() }}>取消</Button>,
          <Button key="ok" type="primary" onClick={handleSave}>保存</Button>,
        ]}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="数据源名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="描述" rows={2} />
          </Form.Item>
          <Form.Item name="dbType" label="数据库类型" rules={[{ required: true }]} initialValue="MYSQL">
            <Select options={dbTypeOptions} onChange={handleDbTypeChange} />
          </Form.Item>
          <Form.Item name="dbUrl" label="JDBC URL" rules={[{ required: true, message: '请输入JDBC URL' }]}>
            <Input placeholder={jdbcUrlPlaceholders[selectedDbType]} />
          </Form.Item>
          <Form.Item name="dbUsername" label="用户名" rules={[{ required: true }]}>
            <Input placeholder="数据库用户名" />
          </Form.Item>
          <Form.Item name="dbPassword" label="密码" rules={[{ required: true }]}>
            <Input.Password placeholder="数据库密码" />
          </Form.Item>
          <Form.Item name="tableName" label="表名" rules={[{ required: true }]}>
            <Input placeholder="目标表名" />
          </Form.Item>
          <Form.Item name="querySql" label="自定义查询SQL（可选，优先于表名）">
            <Input.TextArea placeholder="SELECT * FROM table WHERE ..." rows={3} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
