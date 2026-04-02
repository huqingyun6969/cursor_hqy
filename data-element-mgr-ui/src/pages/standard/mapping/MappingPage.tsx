import React, { useState, useMemo } from 'react'
import {
  Layout, Tree, Input, Select, Button, Table, Space, Tag, Popconfirm,
  Card, Breadcrumb, Descriptions, Tooltip, message,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, ReloadOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, HomeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Sider, Content } = Layout

// ── Mock: catalog tree ──
const catalogTreeData = [
  {
    title: '全部资源对象(4)',
    key: 'all',
    children: [
      { title: '用户基本信息资源对象', key: 'obj-1' },
      { title: '订单资源对象', key: 'obj-2' },
      { title: '产品资源对象', key: 'obj-3' },
      { title: '供应商资源对象', key: 'obj-4' },
    ],
  },
]

// ── Mock: resource list ──
interface ResourceItem {
  id: number
  name: string
  source: string
  fieldCount: number
  standardCount: number
  updateTime: string
  catalogKey: string
}

const mockResources: ResourceItem[] = [
  { id: 1, name: '用户基本信息资源对象', source: 'ods_sg_user_info', fieldCount: 6, standardCount: 5, updateTime: '2025-12-01 10:30:00', catalogKey: 'obj-1' },
  { id: 2, name: '订单资源对象', source: 'ods_sg_order_info', fieldCount: 8, standardCount: 3, updateTime: '2025-11-28 14:20:00', catalogKey: 'obj-2' },
  { id: 3, name: '产品资源对象', source: 'ods_sg_product_info', fieldCount: 10, standardCount: 7, updateTime: '2025-11-25 09:15:00', catalogKey: 'obj-3' },
  { id: 4, name: '供应商资源对象', source: 'ods_sg_sdddd_info', fieldCount: 6, standardCount: 5, updateTime: '2025-11-20 16:45:00', catalogKey: 'obj-4' },
]

// ── Mock: field mapping list ──
interface FieldItem {
  id: number
  fieldName: string
  fieldCode: string
  fieldType: string
  importance: '重要' | '一般'
  featureTag: string
  standardName: string | null
  otherRule: string | null
}

const mockFields: FieldItem[] = [
  { id: 1, fieldName: '用户姓名', fieldCode: 'user_name', fieldType: 'VARCHAR(64)', importance: '重要', featureTag: '身份标识', standardName: '用户姓名标准', otherRule: null },
  { id: 2, fieldName: '身份证号', fieldCode: 'id_card', fieldType: 'VARCHAR(18)', importance: '重要', featureTag: '身份标识', standardName: '身份证号标准', otherRule: null },
  { id: 3, fieldName: '手机号码', fieldCode: 'phone', fieldType: 'VARCHAR(11)', importance: '重要', featureTag: '联系方式', standardName: '手机号码标准', otherRule: null },
  { id: 4, fieldName: '电子邮箱', fieldCode: 'email', fieldType: 'VARCHAR(128)', importance: '一般', featureTag: '联系方式', standardName: null, otherRule: null },
  { id: 5, fieldName: '注册时间', fieldCode: 'register_time', fieldType: 'DATETIME', importance: '一般', featureTag: '时间属性', standardName: '日期时间标准', otherRule: null },
  { id: 6, fieldName: '用户状态', fieldCode: 'status', fieldType: 'INT', importance: '一般', featureTag: '状态属性', standardName: null, otherRule: null },
]

const dataSourceOptions = [
  { label: '全部', value: '' },
  { label: 'ODS层', value: 'ods' },
  { label: 'DWD层', value: 'dwd' },
  { label: 'DWS层', value: 'dws' },
]

// ── Detail View ──
const DetailView: React.FC<{
  resource: ResourceItem
  onBack: () => void
}> = ({ resource, onBack }) => {
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const filteredFields = useMemo(
    () => mockFields.filter(f =>
      !searchText || f.fieldName.includes(searchText) || f.fieldCode.includes(searchText),
    ),
    [searchText],
  )

  const fieldColumns: ColumnsType<FieldItem> = [
    { title: '字段名称', dataIndex: 'fieldName', width: 120 },
    { title: '字段编码', dataIndex: 'fieldCode', width: 140 },
    { title: '字段类型', dataIndex: 'fieldType', width: 120 },
    {
      title: '重要级别',
      dataIndex: 'importance',
      width: 100,
      render: (val: string) => (
        <Tag color={val === '重要' ? 'red' : 'orange'}>{val}</Tag>
      ),
    },
    { title: '特征标签', dataIndex: 'featureTag', width: 100 },
    {
      title: '数据标准',
      dataIndex: 'standardName',
      width: 140,
      render: (val: string | null) =>
        val ? <a style={{ color: '#1677ff' }}>{val}</a> : <span style={{ color: '#999' }}>未配置</span>,
    },
    {
      title: '其他质量规则',
      dataIndex: 'otherRule',
      width: 120,
      render: (val: string | null) => val || <span style={{ color: '#999' }}>无</span>,
    },
    {
      title: '操作',
      width: 150,
      render: (_, record) => (
        <Space size={0} split={<span style={{ color: '#d9d9d9', margin: '0 4px' }}>|</span>}>
          <Tooltip title="查看">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => message.info(`查看字段: ${record.fieldName}`)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => message.info(`编辑字段: ${record.fieldName}`)} />
          </Tooltip>
          <Popconfirm title="确认删除?" onConfirm={() => message.success('删除成功')}>
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Breadcrumb
        items={[
          { title: <><HomeOutlined /> 落标映射管理</>, onClick: onBack, href: '#' },
          { title: '详情' },
        ]}
      />

      <Card size="small" title="资源对象信息">
        <Descriptions column={3} size="small" bordered>
          <Descriptions.Item label="资源对象来源">{resource.source}</Descriptions.Item>
          <Descriptions.Item label="资源对象名">{resource.name}</Descriptions.Item>
          <Descriptions.Item label="资源对象编码">{resource.source}</Descriptions.Item>
          <Descriptions.Item label="资源所属部门">数据管理部</Descriptions.Item>
          <Descriptions.Item label="重要字段数量">
            <span style={{ color: '#f5222d', fontWeight: 600 }}>3</span>
          </Descriptions.Item>
          <Descriptions.Item label="数据字段数量">{resource.fieldCount}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        size="small"
        title="落标映射列表"
        extra={
          <Space>
            <Input
              placeholder="搜索字段名称/编码"
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 220 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />}>批量落标映射</Button>
          </Space>
        }
      >
        <Table<FieldItem>
          rowKey="id"
          columns={fieldColumns}
          dataSource={filteredFields}
          size="small"
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }}
        />
      </Card>
    </div>
  )
}

// ── Main Page ──
const MappingPage: React.FC = () => {
  const [mode, setMode] = useState<'list' | 'detail'>('list')
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null)
  const [selectedCatalogKey, setSelectedCatalogKey] = useState<string>('all')
  const [searchName, setSearchName] = useState('')
  const [searchSource, setSearchSource] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [catalogSearch, setCatalogSearch] = useState('')

  const filteredResources = useMemo(() => {
    let list = mockResources
    if (selectedCatalogKey && selectedCatalogKey !== 'all') {
      list = list.filter(r => r.catalogKey === selectedCatalogKey)
    }
    if (searchName) {
      list = list.filter(r => r.name.includes(searchName))
    }
    if (searchSource) {
      list = list.filter(r => r.source.toLowerCase().includes(searchSource.toLowerCase()))
    }
    return list
  }, [selectedCatalogKey, searchName, searchSource])

  const handleView = (record: ResourceItem) => {
    setSelectedResource(record)
    setMode('detail')
  }

  const handleReset = () => {
    setSearchName('')
    setSearchSource('')
  }

  const columns: ColumnsType<ResourceItem> = [
    { title: '资源对象名称', dataIndex: 'name', width: 200 },
    { title: '对象来源', dataIndex: 'source', width: 180 },
    {
      title: '映射字段对象数',
      dataIndex: 'fieldCount',
      width: 130,
      render: (val: number) => <a>{val}</a>,
    },
    {
      title: '映射标准数',
      dataIndex: 'standardCount',
      width: 110,
      render: (val: number) => <a>{val}</a>,
    },
    { title: '最后更新时间', dataIndex: 'updateTime', width: 180 },
    {
      title: '操作',
      width: 150,
      render: (_, record) => (
        <Space size={0} split={<span style={{ color: '#d9d9d9', margin: '0 4px' }}>|</span>}>
          <Tooltip title="查看">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => message.info(`编辑: ${record.name}`)} />
          </Tooltip>
          <Popconfirm title="确认删除?" onConfirm={() => message.success('删除成功')}>
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (mode === 'detail' && selectedResource) {
    return <DetailView resource={selectedResource} onBack={() => setMode('list')} />
  }

  return (
    <Layout style={{ background: 'transparent', gap: 16, height: '100%' }}>
      <Sider width={240} style={{ background: '#fff', borderRadius: 8, padding: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>映射目录</div>
        <Input
          placeholder="搜索目录"
          prefix={<SearchOutlined />}
          allowClear
          size="small"
          style={{ marginBottom: 8 }}
          value={catalogSearch}
          onChange={e => setCatalogSearch(e.target.value)}
        />
        <Tree
          treeData={catalogTreeData}
          defaultExpandAll
          selectedKeys={[selectedCatalogKey]}
          onSelect={(keys) => setSelectedCatalogKey((keys[0] as string) || 'all')}
          style={{ fontSize: 13 }}
        />
      </Sider>

      <Content style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card size="small" style={{ borderRadius: 8 }}>
          <Space wrap>
            <span style={{ fontSize: 13 }}>资源对象名称</span>
            <Input
              placeholder="请输入"
              allowClear
              style={{ width: 200 }}
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
            />
            <span style={{ fontSize: 13 }}>数据来源</span>
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 160 }}
              options={dataSourceOptions}
              value={searchSource || undefined}
              onChange={val => setSearchSource(val || '')}
            />
            <Button type="primary" icon={<SearchOutlined />}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
          </Space>
        </Card>

        <Card
          size="small"
          style={{ borderRadius: 8, flex: 1 }}
          title={<span style={{ fontWeight: 600 }}>落标映射列表</span>}
          extra={
            <Button type="primary" icon={<PlusOutlined />}>新建落标映射</Button>
          }
        >
          <Table<ResourceItem>
            rowKey="id"
            columns={columns}
            dataSource={filteredResources}
            size="small"
            rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: total => `共 ${total} 条`,
            }}
          />
        </Card>
      </Content>
    </Layout>
  )
}

export default MappingPage
