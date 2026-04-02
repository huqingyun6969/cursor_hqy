import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Layout, Tree, Input, Tabs, Button, Card, Tag, Row, Col, Descriptions,
  Table, Timeline, Modal, Form, Select, Space, Empty, message, Popconfirm,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, FileTextOutlined, FolderOutlined,
  DownloadOutlined, EyeOutlined, ArrowLeftOutlined, EditOutlined,
  DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined,
  CloseCircleOutlined, FormOutlined,
} from '@ant-design/icons'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import {
  getCatalogTree, getDocumentPage, getDocument, createDocument,
  getDocRules, createDocRule, updateDocRule, deleteDocRule, getApprovals,
} from '../../../api/standard'

const { Sider, Content } = Layout

// ─── Types ───────────────────────────────────────────────────────────
interface DocItem {
  id: number; name: string; code: string; typeCategory: string
  compileUnit: string; usageDesc: string; status: string
  catalogId: number; createdAt: string; taskStep?: string
  attachments?: { name: string; url: string }[]
}

interface DocRule {
  id: number; documentId: number; ruleCode: string
  ruleType: string; ruleTag: string; ruleDesc: string
}

interface ApprovalRecord {
  id: number; action: string; operator: string
  remark: string; createdAt: string
}

interface CatalogNode {
  id: number; name: string; children?: CatalogNode[]
}

// ─── Mock data ───────────────────────────────────────────────────────
const mockDocuments: DocItem[] = [
  { id: 1, name: '交通数据采集规范', code: 'TJ/DC-001', typeCategory: '标准规范', compileUnit: '交通运输部', usageDesc: '定义交通数据采集流程与格式要求', status: 'APPROVED', catalogId: 1, createdAt: '2025-06-01 12:02:09' },
  { id: 2, name: '交通数据采集规范', code: 'TJ/DC-001', typeCategory: '标准规范', compileUnit: '交通运输部', usageDesc: '定义交通数据采集流程与格式要求', status: 'APPROVED', catalogId: 1, createdAt: '2025-06-01 12:02:09' },
  { id: 3, name: '交通数据采集规范', code: 'TJ/DC-001', typeCategory: '标准规范', compileUnit: '交通运输部', usageDesc: '定义交通数据采集流程与格式要求', status: 'APPROVED', catalogId: 2, createdAt: '2025-06-01 12:02:09' },
  { id: 4, name: '交通数据采集规范', code: 'TJ/DC-001', typeCategory: '标准规范', compileUnit: '交通运输部', usageDesc: '定义交通数据采集流程与格式要求', status: 'APPROVED', catalogId: 2, createdAt: '2025-06-01 12:02:09' },
]

const mockCatalog: CatalogNode[] = [
  { id: 0, name: '全部标准文档(4)', children: [
    { id: 1, name: '交通标准文档' },
    { id: 2, name: '环保标准文档' },
  ]},
]

const mockRules: DocRule[] = [
  { id: 1, documentId: 1, ruleCode: 'R-001', ruleType: '格式规则', ruleTag: '数据采集', ruleDesc: '数据字段需符合统一编码格式' },
  { id: 2, documentId: 1, ruleCode: 'R-002', ruleType: '质量规则', ruleTag: '完整性', ruleDesc: '必填字段不允许为空' },
]

const mockApprovals: ApprovalRecord[] = [
  { id: 1, action: 'SUBMIT', operator: '张三', remark: '提交审核', createdAt: '2025-06-01 10:00:00' },
  { id: 2, action: 'APPROVE', operator: '李四', remark: '审核通过', createdAt: '2025-06-02 14:30:00' },
]

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '起草中', color: 'default' },
  PENDING: { label: '审核中', color: 'processing' },
  APPROVED: { label: '已审核', color: 'success' },
  REJECTED: { label: '已驳回', color: 'error' },
}

const STATUS_TABS = [
  { key: 'DRAFT', label: '起草中' },
  { key: 'PENDING', label: '审核中' },
  { key: 'APPROVED', label: '已审核' },
  { key: 'REJECTED', label: '已驳回' },
]

// ─── Helpers ─────────────────────────────────────────────────────────
async function safeFetch<T>(fn: () => Promise<any>, fallback: T): Promise<T> {
  try {
    const res = await fn()
    const data = res?.data?.data ?? res?.data
    return (data !== undefined && data !== null) ? data : fallback
  } catch {
    return fallback
  }
}

const buildTreeData = (nodes: CatalogNode[]): any[] =>
  nodes.map(n => ({
    title: n.name, key: String(n.id),
    icon: n.children ? <FolderOutlined /> : <FileTextOutlined />,
    children: n.children ? buildTreeData(n.children) : undefined,
  }))

// ─── Document List View ──────────────────────────────────────────────
const DocumentList: React.FC = () => {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<DocItem[]>(mockDocuments)
  const [catalog, setCatalog] = useState<CatalogNode[]>(mockCatalog)
  const [activeStatus, setActiveStatus] = useState('APPROVED')
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null)
  const [treeSearch, setTreeSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    safeFetch(() => getCatalogTree(), mockCatalog).then(setCatalog)
    safeFetch(() => getDocumentPage({ page: 1, size: 50 }), { records: mockDocuments })
      .then((d: any) => setDocuments(d.records ?? d))
  }, [])

  const filtered = useMemo(() => {
    let list = documents.filter(d => d.status === activeStatus)
    if (selectedCatalog && selectedCatalog !== '0') {
      list = list.filter(d => String(d.catalogId) === selectedCatalog)
    }
    return list
  }, [documents, activeStatus, selectedCatalog])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { DRAFT: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 }
    documents.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++ })
    return counts
  }, [documents])

  const treeData = useMemo(() => {
    if (!treeSearch) return buildTreeData(catalog)
    const filterTree = (nodes: CatalogNode[]): CatalogNode[] =>
      nodes.reduce<CatalogNode[]>((acc, n) => {
        if (n.name.includes(treeSearch)) { acc.push(n); return acc }
        if (n.children) {
          const ch = filterTree(n.children)
          if (ch.length) acc.push({ ...n, children: ch })
        }
        return acc
      }, [])
    return buildTreeData(filterTree(catalog))
  }, [catalog, treeSearch])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await safeFetch(() => createDocument(values), { id: Date.now(), ...values, status: 'DRAFT', createdAt: new Date().toISOString() })
      message.success('创建成功')
      setCreateOpen(false)
      form.resetFields()
      safeFetch(() => getDocumentPage({ page: 1, size: 50 }), { records: mockDocuments })
        .then((d: any) => setDocuments(d.records ?? d))
    } catch { /* validation */ }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircleOutlined />
      case 'PENDING': return <ClockCircleOutlined />
      case 'REJECTED': return <CloseCircleOutlined />
      default: return <FormOutlined />
    }
  }

  return (
    <Layout style={{ height: '100%', background: '#fff', borderRadius: 8 }}>
      <Sider width={240} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', padding: '16px 12px' }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>标准文档目录</div>
        <Input
          placeholder="搜索目录" prefix={<SearchOutlined />} size="small" allowClear
          value={treeSearch} onChange={e => setTreeSearch(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Tree
          showIcon treeData={treeData} defaultExpandAll
          selectedKeys={selectedCatalog ? [selectedCatalog] : []}
          onSelect={keys => setSelectedCatalog(keys[0] as string ?? null)}
        />
      </Sider>

      <Content style={{ padding: '16px 20px' }}>
        <Tabs
          activeKey={activeStatus} onChange={setActiveStatus}
          tabBarExtraContent={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              新建标准文档
            </Button>
          }
          items={STATUS_TABS.map(t => ({
            key: t.key,
            label: <span>{t.label}({statusCounts[t.key] || 0})</span>,
          }))}
        />

        {filtered.length === 0 ? (
          <Empty description="暂无数据" style={{ marginTop: 80 }} />
        ) : (
          <Row gutter={[16, 16]}>
            {filtered.map(doc => (
              <Col xs={24} sm={12} lg={8} xl={6} key={doc.id}>
                <Card
                  hoverable size="small"
                  onClick={() => navigate(`${doc.id}`)}
                  style={{ borderRadius: 8 }}
                  styles={{ body: { padding: '16px' } }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                      background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FileTextOutlined style={{ color: '#fff', fontSize: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.name}
                        </span>
                        <Tag color={STATUS_MAP[doc.status]?.color} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                          {statusIcon(doc.status)} {STATUS_MAP[doc.status]?.label}
                        </Tag>
                      </div>
                    </div>
                  </div>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                    {doc.usageDesc}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: 12 }}>
                    <span>{doc.code}</span>
                    <span>{doc.createdAt?.slice(0, 10)}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Content>

      <Modal title="新建标准文档" open={createOpen} onOk={handleCreate} onCancel={() => setCreateOpen(false)} destroyOnClose width={560}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="标准名称" name="name" rules={[{ required: true, message: '请输入标准名称' }]}>
            <Input placeholder="请输入标准名称" />
          </Form.Item>
          <Form.Item label="编号" name="code" rules={[{ required: true, message: '请输入编号' }]}>
            <Input placeholder="请输入编号" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="标准类型分类" name="typeCategory">
                <Select placeholder="请选择" options={[
                  { value: '标准规范', label: '标准规范' },
                  { value: '技术标准', label: '技术标准' },
                  { value: '管理标准', label: '管理标准' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="所属目录" name="catalogId">
                <Select placeholder="请选择" options={[
                  { value: 1, label: '交通标准文档' },
                  { value: 2, label: '环保标准文档' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="编制单位" name="compileUnit">
            <Input placeholder="请输入编制单位" />
          </Form.Item>
          <Form.Item label="用途说明" name="usageDesc">
            <Input.TextArea rows={3} placeholder="请输入用途说明" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

// ─── Document Detail View ────────────────────────────────────────────
const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<DocItem | null>(null)
  const [rules, setRules] = useState<DocRule[]>(mockRules)
  const [approvals, setApprovals] = useState<ApprovalRecord[]>(mockApprovals)
  const [ruleModalOpen, setRuleModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<DocRule | null>(null)
  const [ruleForm] = Form.useForm()

  const docId = Number(id)

  const loadData = useCallback(async () => {
    const d = await safeFetch(() => getDocument(docId), mockDocuments.find(m => m.id === docId) ?? mockDocuments[0])
    setDoc(d)
    safeFetch(() => getDocRules(docId), mockRules).then(setRules)
    safeFetch(() => getApprovals(docId), mockApprovals).then(setApprovals)
  }, [docId])

  useEffect(() => { loadData() }, [loadData])

  const handleRuleSave = async () => {
    try {
      const values = await ruleForm.validateFields()
      if (editingRule) {
        await safeFetch(() => updateDocRule(editingRule.id, { ...values, documentId: docId }), null)
        message.success('更新成功')
      } else {
        await safeFetch(() => createDocRule({ ...values, documentId: docId }), null)
        message.success('创建成功')
      }
      setRuleModalOpen(false)
      setEditingRule(null)
      ruleForm.resetFields()
      safeFetch(() => getDocRules(docId), mockRules).then(setRules)
    } catch { /* validation */ }
  }

  const handleRuleDelete = async (ruleId: number) => {
    await safeFetch(() => deleteDocRule(ruleId), null)
    message.success('删除成功')
    safeFetch(() => getDocRules(docId), mockRules).then(setRules)
  }

  const openRuleEdit = (rule: DocRule) => {
    setEditingRule(rule)
    ruleForm.setFieldsValue(rule)
    setRuleModalOpen(true)
  }

  const openRuleCreate = () => {
    setEditingRule(null)
    ruleForm.resetFields()
    setRuleModalOpen(true)
  }

  const ruleColumns = [
    { title: '编号', dataIndex: 'ruleCode', width: 100 },
    { title: '细则类型', dataIndex: 'ruleType', width: 120 },
    { title: '细则标签', dataIndex: 'ruleTag', width: 120, render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '细则描述', dataIndex: 'ruleDesc', ellipsis: true },
    {
      title: '操作', width: 140,
      render: (_: any, record: DocRule) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openRuleEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleRuleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const approvalTimelineIcon = (action: string) => {
    const map: Record<string, { color: string; icon: React.ReactNode }> = {
      SUBMIT: { color: 'blue', icon: <FormOutlined /> },
      APPROVE: { color: 'green', icon: <CheckCircleOutlined /> },
      REJECT: { color: 'red', icon: <CloseCircleOutlined /> },
    }
    return map[action] || { color: 'gray', icon: <ClockCircleOutlined /> }
  }

  if (!doc) return null

  const statusInfo = STATUS_MAP[doc.status] || STATUS_MAP.DRAFT

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('..')} style={{ padding: 0, marginRight: 12 }}>
          返回
        </Button>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{doc.name}</span>
        <Tag color={statusInfo.color} style={{ marginLeft: 12 }}>{statusInfo.label}</Tag>
      </div>

      {/* 标准详情 */}
      <Card title="标准详情" size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="标准名称">{doc.name}</Descriptions.Item>
          <Descriptions.Item label="编号">{doc.code}</Descriptions.Item>
          <Descriptions.Item label="所属目录">
            {mockCatalog[0]?.children?.find(c => c.id === doc.catalogId)?.name ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="标准类型分类">{doc.typeCategory}</Descriptions.Item>
          <Descriptions.Item label="编制单位">{doc.compileUnit}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{doc.createdAt}</Descriptions.Item>
          <Descriptions.Item label="用途说明" span={2}>{doc.usageDesc}</Descriptions.Item>
          <Descriptions.Item label="任务执行环节" span={2}>{doc.taskStep ?? '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 附件 */}
      <Card title="附件" size="small" style={{ marginBottom: 16 }}>
        {doc.attachments?.length ? (
          doc.attachments.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
              <FileTextOutlined />
              <span>{a.name}</span>
              <Button type="link" size="small" icon={<DownloadOutlined />}>下载</Button>
              <Button type="link" size="small" icon={<EyeOutlined />}>预览</Button>
            </div>
          ))
        ) : (
          <Empty description="暂无附件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* 标准细则 */}
      <Card
        title="标准细则" size="small" style={{ marginBottom: 16 }}
        extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={openRuleCreate}>新增细则</Button>}
      >
        <Table dataSource={rules} columns={ruleColumns} rowKey="id" size="small" pagination={false} />
      </Card>

      {/* 审批流程记录 */}
      <Card title="审批流程记录" size="small">
        {approvals.length === 0 ? (
          <Empty description="暂无审批记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Timeline
            items={approvals.map(a => {
              const ai = approvalTimelineIcon(a.action)
              return {
                color: ai.color, dot: ai.icon,
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {a.action === 'SUBMIT' ? '提交审核' : a.action === 'APPROVE' ? '审核通过' : a.action === 'REJECT' ? '审核驳回' : a.action}
                    </div>
                    <div style={{ color: '#666', fontSize: 13 }}>{a.remark}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>{a.operator} · {a.createdAt}</div>
                  </div>
                ),
              }
            })}
          />
        )}
      </Card>

      {/* Rule modal */}
      <Modal
        title={editingRule ? '编辑细则' : '新增细则'}
        open={ruleModalOpen} onOk={handleRuleSave}
        onCancel={() => { setRuleModalOpen(false); setEditingRule(null) }}
        destroyOnClose width={500}
      >
        <Form form={ruleForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="编号" name="ruleCode" rules={[{ required: true, message: '请输入编号' }]}>
            <Input placeholder="请输入编号" />
          </Form.Item>
          <Form.Item label="细则类型" name="ruleType" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择" options={[
              { value: '格式规则', label: '格式规则' },
              { value: '质量规则', label: '质量规则' },
              { value: '安全规则', label: '安全规则' },
            ]} />
          </Form.Item>
          <Form.Item label="细则标签" name="ruleTag">
            <Input placeholder="请输入标签" />
          </Form.Item>
          <Form.Item label="细则描述" name="ruleDesc" rules={[{ required: true, message: '请输入描述' }]}>
            <Input.TextArea rows={3} placeholder="请输入细则描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// ─── Main Page Component ─────────────────────────────────────────────
const DocumentPage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<DocumentList />} />
      <Route path=":id" element={<DocumentDetail />} />
    </Routes>
  )
}

export default DocumentPage
