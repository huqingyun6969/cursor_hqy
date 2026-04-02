import React, { useState, useMemo } from 'react'
import {
  Layout, Tree, Table, Button, Input, Tag, Tabs, Space, Form, Steps, Select,
  Modal, Radio, InputNumber, Pagination, message, Upload, Popconfirm,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, UploadOutlined,
  FolderOutlined, FolderOpenOutlined, DownloadOutlined, DeleteOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getStdInfoPage, getStdInfo, createStdInfo, updateStdInfo,
  getStdRules, createStdRule, deleteStdRule,
  getRefDocs, deleteRefDoc,
} from '../../../api/standard'

/* ───── types ───── */
interface StdSet { id: number; name: string }
interface StdRecord {
  id: number; stdName: string; setCatalog: string; stdCode: string
  remark: string; status: string; updatedAt: string
}
interface RuleRecord {
  id: number; ruleName: string; groupType: string; ruleType: string
  ruleDesc: string; detectRule: string
}
interface RefDocRecord {
  id: number; docName: string; ruleDesc: string; catalog: string
  effectTime: string; url: string
}

/* ───── mock data ───── */
const mockSets: StdSet[] = [
  { id: 1, name: 'XXXX标准集' },
  { id: 2, name: 'XXXX标准集' },
  { id: 3, name: 'XXXX标准集' },
  { id: 4, name: 'XXXX标准集' },
]

const mockStandards: StdRecord[] = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  stdName: 'xxxxx标准集',
  setCatalog: 'xxxxx标准集',
  stdCode: '标准编码',
  remark: '标准描述内容标准描述内容',
  status: 'ACTIVE',
  updatedAt: '2026-04-01 14:23:01',
}))

const mockRules: RuleRecord[] = [
  { id: 1, ruleName: '规则一', groupType: '基础校验', ruleType: '非空校验', ruleDesc: '字段不可为空', detectRule: 'NOT NULL' },
]

const mockRefDocs: RefDocRecord[] = [
  { id: 1, docName: '文档一.pdf', ruleDesc: '细则描述', catalog: '目录A', effectTime: '2026-01-01', url: '#' },
]

const statusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '已生效', color: 'green' },
  REVISING: { label: '修订中', color: 'blue' },
  PUBLISHING: { label: '发布中', color: 'orange' },
  INACTIVE: { label: '已失效', color: 'default' },
}

const statusTabs = [
  { key: '', label: '全部' },
  { key: 'ACTIVE', label: '已生效' },
  { key: 'REVISING', label: '修订中' },
  { key: 'PUBLISHING', label: '发布中' },
  { key: 'INACTIVE', label: '已失效' },
]

type PageMode = 'list' | 'create' | 'edit' | 'detail'

const buildTree = (sets: StdSet[]) => [
  {
    key: 'all',
    title: `全部数据标准(${sets.length})`,
    icon: <FolderOpenOutlined />,
    children: sets.map((s) => ({
      key: String(s.id),
      title: s.name,
      icon: <FolderOutlined />,
    })),
  },
]

/* ═══════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════ */
const DataStandardPage: React.FC = () => {
  const [mode, setMode] = useState<PageMode>('list')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedSetId, setSelectedSetId] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchName, setSearchName] = useState('')
  const [dataList, setDataList] = useState(mockStandards)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 4 })
  const [loading, setLoading] = useState(false)
  const [sets] = useState(mockSets)

  const filteredData = useMemo(() => {
    let list = dataList
    if (statusFilter) list = list.filter((d) => d.status === statusFilter)
    if (searchName) list = list.filter((d) => d.stdName.includes(searchName))
    if (selectedSetId !== 'all')
      list = list.filter((d) => d.setCatalog === sets.find((s) => String(s.id) === selectedSetId)?.name)
    return list
  }, [dataList, statusFilter, searchName, selectedSetId, sets])

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await getStdInfoPage({
        page: pagination.current, size: pagination.pageSize,
        status: statusFilter || undefined, stdName: searchName || undefined,
      })
      const d = (res as unknown as Record<string, Record<string, unknown>>)?.data
      setDataList((d?.records as StdRecord[] | undefined) ?? mockStandards)
      setPagination((p) => ({ ...p, total: (d?.total as number | undefined) ?? 4 }))
    } catch (_e) {
      void _e
      setDataList(mockStandards)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => { setPagination((p) => ({ ...p, current: 1 })); fetchList() }
  const handleReset = () => { setSearchName(''); setStatusFilter(''); setPagination((p) => ({ ...p, current: 1 })) }

  const openCreate = () => { setEditingId(null); setMode('create') }
  const openEdit = (id: number) => { setEditingId(id); setMode('edit') }
  const openDetail = (id: number) => { setEditingId(id); setMode('detail') }
  const backToList = () => { setMode('list'); setEditingId(null) }

  const handleClone = async (record: StdRecord) => {
    try {
      await createStdInfo({ ...record, id: undefined, stdName: record.stdName + '_副本' })
      message.success('克隆成功')
      fetchList()
    } catch (_e) { void _e; message.info('克隆(mock)') }
  }

  const handleOffline = async (id: number) => {
    try {
      await updateStdInfo(id, { status: 'INACTIVE' })
      message.success('已下线')
      fetchList()
    } catch (_e) { void _e; message.info('下线(mock)') }
  }

  const statusCounts = useMemo(() => {
    const m: Record<string, number> = { ACTIVE: 0, REVISING: 0, PUBLISHING: 0, INACTIVE: 0 }
    dataList.forEach((d) => { m[d.status] = (m[d.status] || 0) + 1 })
    return m
  }, [dataList])

  const columns: ColumnsType<StdRecord> = [
    { title: '标准名称', dataIndex: 'stdName', width: 160 },
    { title: '所属标准集', dataIndex: 'setCatalog', width: 140 },
    { title: '标准编码', dataIndex: 'stdCode', width: 120 },
    { title: '标准描述', dataIndex: 'remark', ellipsis: true },
    { title: '最近更新时间', dataIndex: 'updatedAt', width: 180 },
    {
      title: '状态', dataIndex: 'status', width: 90,
      render: (v: string) => {
        const s = statusMap[v] || { label: v, color: 'default' }
        return <Tag color={s.color}>{s.label}</Tag>
      },
    },
    {
      title: '操作', width: 260, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openDetail(record.id)}>查看</Button>
          <Button type="link" size="small" onClick={() => openEdit(record.id)}>编辑</Button>
          <Popconfirm title="确认下线？" onConfirm={() => handleOffline(record.id)}>
            <Button type="link" size="small" danger>下线</Button>
          </Popconfirm>
          <Button type="link" size="small">审批信息</Button>
          <Button type="link" size="small" onClick={() => handleClone(record)}>克隆</Button>
        </Space>
      ),
    },
  ]

  if (mode === 'list') {
    return (
      <Layout style={{ height: '100%', background: '#fff' }}>
        <Layout.Sider width={240} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', padding: 12, overflow: 'auto' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>标准集目录</div>
          <Tree
            showIcon
            defaultExpandAll
            treeData={buildTree(sets)}
            selectedKeys={[selectedSetId]}
            onSelect={(keys) => setSelectedSetId((keys[0] as string) || 'all')}
          />
        </Layout.Sider>

        <Layout.Content style={{ padding: 16, overflow: 'auto' }}>
          <Tabs
            activeKey={statusFilter}
            onChange={(k) => { setStatusFilter(k); setPagination((p) => ({ ...p, current: 1 })) }}
            items={statusTabs.map((t) => ({
              key: t.key,
              label: t.key ? `${t.label}(${statusCounts[t.key] ?? 0})` : t.label,
            }))}
            style={{ marginBottom: 12 }}
          />
          <Space style={{ marginBottom: 12 }} wrap>
            <Input
              placeholder="标准名称"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Button icon={<SearchOutlined />} type="primary" onClick={handleSearch}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建标准</Button>
            <Upload showUploadList={false} beforeUpload={() => { message.info('批量导入'); return false }}>
              <Button icon={<UploadOutlined />}>批量导入</Button>
            </Upload>
          </Space>
          <Table<StdRecord>
            rowKey="id"
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowSelection={{ type: 'checkbox' }}
            pagination={false}
            scroll={{ x: 1000 }}
            size="middle"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={filteredData.length}
              showSizeChanger
              showTotal={(t) => `共 ${t} 条`}
              onChange={(page, size) => setPagination({ current: page, pageSize: size, total: pagination.total })}
            />
          </div>
        </Layout.Content>
      </Layout>
    )
  }

  return (
    <StandardForm
      mode={mode}
      editingId={editingId}
      sets={sets}
      onCancel={backToList}
      onSuccess={() => { backToList(); fetchList() }}
    />
  )
}

/* ═══════════════════════════════════════════════════
   Standard Form (create / edit / detail)
   ═══════════════════════════════════════════════════ */
interface FormProps {
  mode: PageMode
  editingId: number | null
  sets: StdSet[]
  onCancel: () => void
  onSuccess: () => void
}

const stepItems = [
  { title: '属性配置' },
  { title: '落标映射配置' },
  { title: '特征标签配置' },
  { title: '关联信息配置' },
]

const noop = (_e: unknown) => { void _e }

const StandardForm: React.FC<FormProps> = ({ mode, editingId, sets, onCancel, onSuccess }) => {
  const [step, setStep] = useState(0)
  const [form] = Form.useForm()
  const [rules, setRules] = useState<RuleRecord[]>(mockRules)
  const [refDocs, setRefDocs] = useState<RefDocRecord[]>(mockRefDocs)
  const [submitting, setSubmitting] = useState(false)
  const [ruleModalOpen, setRuleModalOpen] = useState(false)
  const [ruleForm] = Form.useForm()
  const readOnly = mode === 'detail'

  React.useEffect(() => {
    if (editingId && (mode === 'edit' || mode === 'detail')) {
      getStdInfo(editingId).then((res) => {
        const d = res as unknown as Record<string, unknown> | undefined
        form.setFieldsValue((d?.data as Record<string, unknown>) ?? {})
      }).catch(noop)
      getStdRules(editingId).then((res) => {
        const d = res as unknown as Record<string, unknown> | undefined
        setRules((d?.data as RuleRecord[]) ?? mockRules)
      }).catch(noop)
      getRefDocs(editingId).then((res) => {
        const d = res as unknown as Record<string, unknown> | undefined
        setRefDocs((d?.data as RefDocRecord[]) ?? mockRefDocs)
      }).catch(noop)
    }
  }, [editingId, mode, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      if (mode === 'edit' && editingId) {
        await updateStdInfo(editingId, values)
      } else {
        await createStdInfo(values)
      }
      message.success('保存成功')
      onSuccess()
    } catch (_e) {
      void _e
      message.error('请检查表单')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddRule = async () => {
    try {
      const vals = await ruleForm.validateFields()
      if (editingId) {
        await createStdRule({ ...vals, stdInfoId: editingId }).catch(noop)
      }
      setRules((r) => [...r, { ...vals, id: Date.now() }])
      setRuleModalOpen(false)
      ruleForm.resetFields()
    } catch (_e) { void _e }
  }

  const handleDeleteRule = async (id: number) => {
    try { await deleteStdRule(id) } catch (_e) { void _e }
    setRules((r) => r.filter((x) => x.id !== id))
  }

  const handleDeleteRef = async (id: number) => {
    try { await deleteRefDoc(id) } catch (_e) { void _e }
    setRefDocs((r) => r.filter((x) => x.id !== id))
  }

  const ruleColumns: ColumnsType<RuleRecord> = [
    { title: '规则名称', dataIndex: 'ruleName' },
    { title: '组别类型', dataIndex: 'groupType' },
    { title: '规则类型', dataIndex: 'ruleType' },
    { title: '规则描述', dataIndex: 'ruleDesc' },
    { title: '检测规则', dataIndex: 'detectRule' },
    {
      title: '操作', width: 120,
      render: (_, r) => readOnly ? null : (
        <Popconfirm title="确认删除？" onConfirm={() => handleDeleteRule(r.id)}>
          <Button type="link" size="small" danger>删除</Button>
        </Popconfirm>
      ),
    },
  ]

  const refDocColumns: ColumnsType<RefDocRecord> = [
    { title: '文档名称', dataIndex: 'docName' },
    { title: '细则描述', dataIndex: 'ruleDesc' },
    { title: '所属目录', dataIndex: 'catalog' },
    { title: '生效时间', dataIndex: 'effectTime' },
    {
      title: '操作', width: 140,
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small" icon={<DownloadOutlined />} href={r.url}>下载</Button>
          {!readOnly && (
            <Popconfirm title="确认删除？" onConfirm={() => handleDeleteRef(r.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const formLayout = { labelCol: { span: 6 }, wrapperCol: { span: 16 } }

  return (
    <div style={{ background: '#fff', padding: 24, height: '100%', overflow: 'auto' }}>
      <Steps current={step} items={stepItems} style={{ marginBottom: 24, maxWidth: 600 }} size="small" />

      <Form form={form} {...formLayout} disabled={readOnly} style={{ display: step === 0 ? 'block' : 'none' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>基础信息</div>
        <Form.Item label="标准编号" name="stdCode"><Input placeholder="自动生成" disabled /></Form.Item>
        <Form.Item label="标准名称" name="stdName" rules={[{ required: true, message: '请输入' }]}><Input /></Form.Item>
        <Form.Item label="英文名称" name="enName"><Input /></Form.Item>
        <Form.Item label="标准别名" name="alias"><Input /></Form.Item>
        <Form.Item label="所属标准集" name="setId" rules={[{ required: true, message: '请选择' }]}>
          <Select options={sets.map((s) => ({ value: s.id, label: s.name }))} placeholder="请选择" />
        </Form.Item>
        <Form.Item label="标准内容" name="content"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item label="备注" name="remark"><Input.TextArea rows={2} /></Form.Item>

        <div style={{ fontWeight: 600, margin: '16px 0 12px' }}>业务属性</div>
        <Form.Item label="业务规则" name="bizRule"><Input /></Form.Item>
        <Form.Item label="业务定义" name="bizDef"><Input.TextArea rows={2} /></Form.Item>
        <Form.Item label="定义依据" name="defBasis"><Input /></Form.Item>
        <Form.Item label="取值范围" name="valueRange"><Input /></Form.Item>

        <div style={{ fontWeight: 600, margin: '16px 0 12px' }}>技术属性</div>
        <Form.Item label="数据类型" name="dataType">
          <Select options={['STRING', 'INTEGER', 'DECIMAL', 'DATE', 'BOOLEAN'].map((v) => ({ value: v, label: v }))} />
        </Form.Item>
        <Form.Item label="计量单位" name="unit"><Input /></Form.Item>
        <Form.Item label="是否可为空" name="nullable">
          <Radio.Group options={[{ label: '是', value: true }, { label: '否', value: false }]} />
        </Form.Item>
        <Form.Item label="是否唯一值" name="unique">
          <Radio.Group options={[{ label: '是', value: true }, { label: '否', value: false }]} />
        </Form.Item>
        <Form.Item label="数值长度" name="dataLength"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item label="最小值" name="minValue"><InputNumber style={{ width: '100%' }} /></Form.Item>
        <Form.Item label="最大值" name="maxValue"><InputNumber style={{ width: '100%' }} /></Form.Item>
        <Form.Item label="权威系统" name="authSystem"><Input /></Form.Item>

        <div style={{ fontWeight: 600, margin: '16px 0 12px' }}>管理属性</div>
        <Form.Item label="标准定义部门" name="defDept"><Input /></Form.Item>
        <Form.Item label="标准管理人员" name="manager"><Input /></Form.Item>
        <Form.Item label="标准使用部门" name="useDept"><Input /></Form.Item>
      </Form>

      {step === 1 && (
        <div>
          {!readOnly && (
            <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 12 }} onClick={() => setRuleModalOpen(true)}>
              新增质量规则
            </Button>
          )}
          <Table<RuleRecord> rowKey="id" columns={ruleColumns} dataSource={rules} pagination={false} size="small" />
        </div>
      )}

      {step === 2 && (
        <Form form={form} {...formLayout} disabled={readOnly}>
          <Form.Item label="特征标签" name="featureTags">
            <Select mode="tags" placeholder="请输入或选择标签" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      )}

      {step === 3 && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>关联标准细则</div>
          <Table<RefDocRecord> rowKey="id" columns={refDocColumns} dataSource={refDocs} pagination={false} size="small" />
        </div>
      )}

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        {step > 0 && <Button onClick={() => setStep(step - 1)}>上一步</Button>}
        {step < 3 && <Button type="primary" onClick={() => setStep(step + 1)}>下一步</Button>}
        <Button onClick={onCancel}>取消</Button>
        {step === 3 && !readOnly && (
          <Button type="primary" loading={submitting} onClick={handleSubmit}>确定</Button>
        )}
      </div>

      <Modal title="新增质量规则" open={ruleModalOpen} onCancel={() => setRuleModalOpen(false)} onOk={handleAddRule} destroyOnClose>
        <Form form={ruleForm} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item label="规则名称" name="ruleName" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="组别类型" name="groupType" rules={[{ required: true }]}>
            <Select options={['基础校验', '业务校验', '一致性校验'].map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item label="规则类型" name="ruleType" rules={[{ required: true }]}>
            <Select options={['非空校验', '唯一性校验', '范围校验', '格式校验'].map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item label="规则描述" name="ruleDesc"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item label="检测规则" name="detectRule"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DataStandardPage
