import { useEffect, useState, useCallback } from 'react'
import { Card, Row, Col, Typography, Tag, Button, Space, Modal, Form, Input, Select, message, Tooltip, Popconfirm, Divider } from 'antd'
import { PlusOutlined, DeleteOutlined, ThunderboltOutlined, SaveOutlined, ArrowRightOutlined, ArrowDownOutlined, BranchesOutlined, CodeOutlined, DragOutlined } from '@ant-design/icons'
import { listRuleTypeConfigs, listRuleChains, saveRuleChain, deleteRuleChain, listRuleGroups } from '../api'
import type { RuleTypeConfig, RuleChainConfig, RuleGroup } from '../types'

interface ChainNode {
  id: string
  typeCode: string
  typeName: string
  params?: string
  fieldName?: string
}

interface ChainBlock {
  id: string
  operator: 'THEN' | 'WHEN' | 'IF'
  label: string
  nodes: ChainNode[]
}

const OP_COLORS: Record<string, string> = { THEN: '#1890ff', WHEN: '#52c41a', IF: '#faad14' }
const OP_LABELS: Record<string, string> = { THEN: '串行执行', WHEN: '并行执行', IF: '条件执行' }
const OP_ICONS: Record<string, React.ReactNode> = {
  THEN: <ArrowRightOutlined />, WHEN: <BranchesOutlined />, IF: <ThunderboltOutlined />
}

let nodeIdCounter = 0
const genId = () => `node_${++nodeIdCounter}_${Date.now()}`

export default function RuleOrchestrationPage() {
  const [ruleTypes, setRuleTypes] = useState<RuleTypeConfig[]>([])
  const [chains, setChains] = useState<RuleChainConfig[]>([])
  const [groups, setGroups] = useState<RuleGroup[]>([])
  const [blocks, setBlocks] = useState<ChainBlock[]>([{ id: genId(), operator: 'THEN', label: '主流程', nodes: [] }])
  const [selectedNode, setSelectedNode] = useState<{ blockIdx: number; nodeIdx: number } | null>(null)
  const [nodeForm] = Form.useForm()
  const [saveModal, setSaveModal] = useState(false)
  const [saveForm] = Form.useForm()
  const [editingChainId, setEditingChainId] = useState<number | undefined>()
  const [dragType, setDragType] = useState<RuleTypeConfig | null>(null)

  useEffect(() => {
    listRuleTypeConfigs().then(r => setRuleTypes((r.data || []).filter((t: RuleTypeConfig) => t.status === 1)))
    listRuleChains(0).then(r => setChains(r.data || [])).catch(() => {})
    listRuleGroups().then(r => setGroups(r.data || []))
  }, [])

  const addBlock = (operator: 'THEN' | 'WHEN' | 'IF') => {
    setBlocks([...blocks, { id: genId(), operator, label: OP_LABELS[operator], nodes: [] }])
  }

  const removeBlock = (idx: number) => {
    if (blocks.length <= 1) { message.warning('至少保留一个执行块'); return }
    setBlocks(blocks.filter((_, i) => i !== idx))
    setSelectedNode(null)
  }

  const addNodeToBlock = (blockIdx: number, typeCode: string) => {
    const type = ruleTypes.find(t => t.typeCode === typeCode)
    if (!type) return
    const newNode: ChainNode = { id: genId(), typeCode, typeName: type.typeName, params: type.defaultParams || undefined }
    const updated = [...blocks]
    updated[blockIdx] = { ...updated[blockIdx], nodes: [...updated[blockIdx].nodes, newNode] }
    setBlocks(updated)
  }

  const removeNode = (blockIdx: number, nodeIdx: number) => {
    const updated = [...blocks]
    updated[blockIdx] = { ...updated[blockIdx], nodes: updated[blockIdx].nodes.filter((_, i) => i !== nodeIdx) }
    setBlocks(updated)
    setSelectedNode(null)
  }

  const updateNodeProps = () => {
    if (!selectedNode) return
    const values = nodeForm.getFieldsValue()
    const updated = [...blocks]
    const node = updated[selectedNode.blockIdx].nodes[selectedNode.nodeIdx]
    node.fieldName = values.fieldName
    node.params = values.params
    setBlocks(updated)
    message.success('节点属性已更新')
  }

  const selectNode = (blockIdx: number, nodeIdx: number) => {
    setSelectedNode({ blockIdx, nodeIdx })
    const node = blocks[blockIdx].nodes[nodeIdx]
    nodeForm.setFieldsValue({ fieldName: node.fieldName || '', params: node.params || '' })
  }

  const generateEL = useCallback((): string => {
    const parts = blocks.map(block => {
      if (block.nodes.length === 0) return null
      const nodeIds = block.nodes.map(n => {
        const type = ruleTypes.find(t => t.typeCode === n.typeCode)
        const componentId = n.typeCode.toLowerCase()
        return componentId
      })
      if (nodeIds.length === 1) return nodeIds[0]
      return `${block.operator}(${nodeIds.join(', ')})`
    }).filter(Boolean)
    if (parts.length === 0) return ''
    if (parts.length === 1) return `THEN(${parts[0]});`
    return `THEN(${parts.join(', ')});`
  }, [blocks, ruleTypes])

  const handleSave = async () => {
    const values = await saveForm.validateFields()
    const el = generateEL()
    if (!el) { message.error('请至少添加一个规则节点'); return }
    await saveRuleChain({
      id: editingChainId,
      ruleGroupId: values.ruleGroupId,
      chainName: values.chainName,
      fieldName: values.fieldName || '',
      chainEl: el,
      logicType: blocks.length === 1 ? blocks[0].operator : 'COMPOSITE',
      description: values.description || '',
      status: 1,
    })
    message.success('规则编排已保存')
    setSaveModal(false)
    saveForm.resetFields()
    setEditingChainId(undefined)
    listRuleChains(0).then(r => setChains(r.data || [])).catch(() => {})
  }

  const loadChain = (chain: RuleChainConfig) => {
    setEditingChainId(chain.id)
    saveForm.setFieldsValue({ chainName: chain.chainName, ruleGroupId: chain.ruleGroupId, fieldName: chain.fieldName, description: chain.description })

    const el = chain.chainEl || ''
    const parsed = parseELToBlocks(el)
    if (parsed.length > 0) setBlocks(parsed)
    setSaveModal(true)
  }

  const parseELToBlocks = (el: string): ChainBlock[] => {
    const result: ChainBlock[] = []
    const match = el.match(/^(THEN|WHEN|IF)\((.+)\);?$/)
    if (match) {
      const op = match[1] as 'THEN' | 'WHEN' | 'IF'
      const inner = match[2]
      const nodeNames = inner.split(/\s*,\s*/)
      const nodes: ChainNode[] = nodeNames.map(name => {
        const type = ruleTypes.find(t => t.typeCode.toLowerCase() === name.trim().toLowerCase())
        return { id: genId(), typeCode: type?.typeCode || name.toUpperCase(), typeName: type?.typeName || name }
      })
      result.push({ id: genId(), operator: op, label: OP_LABELS[op], nodes })
    }
    return result.length > 0 ? result : [{ id: genId(), operator: 'THEN', label: '主流程', nodes: [] }]
  }

  const handleDrop = (e: React.DragEvent, blockIdx: number) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    if (dragType) {
      addNodeToBlock(blockIdx, dragType.typeCode)
      setDragType(null)
    }
  }

  const currentNode = selectedNode ? blocks[selectedNode.blockIdx]?.nodes[selectedNode.nodeIdx] : null

  return (
    <Row gutter={16} style={{ height: 'calc(100vh - 180px)' }}>
      {/* Left: Rule Type Palette */}
      <Col span={5}>
        <Card title="规则节点" size="small" style={{ height: '100%', overflow: 'auto' }}
          extra={<Typography.Text type="secondary" style={{ fontSize: 11 }}>拖拽到画布</Typography.Text>}>
          {ruleTypes.map(t => (
            <div key={t.typeCode} draggable
              onDragStart={() => setDragType(t)}
              onDragEnd={() => setDragType(null)}
              style={{ padding: '6px 10px', marginBottom: 6, background: '#f0f5ff', border: '1px solid #d6e4ff',
                borderRadius: 6, cursor: 'grab', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <DragOutlined style={{ color: '#999' }} />
              <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>{t.typeCode}</Tag>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.typeName}</span>
            </div>
          ))}
        </Card>
      </Col>

      {/* Center: Canvas */}
      <Col span={13}>
        <Card size="small" style={{ height: '100%', overflow: 'auto' }}
          title={<><CodeOutlined /> 规则编排画布</>}
          extra={<Space>
            <Button size="small" icon={<PlusOutlined />} onClick={() => addBlock('THEN')}>串行块</Button>
            <Button size="small" icon={<PlusOutlined />} onClick={() => addBlock('WHEN')}>并行块</Button>
            <Button size="small" icon={<PlusOutlined />} onClick={() => addBlock('IF')}>条件块</Button>
            <Button size="small" type="primary" icon={<SaveOutlined />} onClick={() => setSaveModal(true)}>保存</Button>
          </Space>}>

          {blocks.map((block, bi) => (
            <div key={block.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <Tag color={OP_COLORS[block.operator]} icon={OP_ICONS[block.operator]} style={{ fontSize: 13 }}>
                  {block.label} ({block.operator})
                </Tag>
                <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                  {block.nodes.length} 个节点
                </Typography.Text>
                {blocks.length > 1 && (
                  <Popconfirm title="删除此执行块？" onConfirm={() => removeBlock(bi)}>
                    <Button size="small" type="link" danger icon={<DeleteOutlined />} style={{ marginLeft: 'auto' }} />
                  </Popconfirm>
                )}
              </div>
              <div
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = '#e6f7ff' }}
                onDragLeave={e => { e.currentTarget.style.background = '#fafafa' }}
                onDrop={e => { handleDrop(e, bi); e.currentTarget.style.background = '#fafafa' }}
                style={{ minHeight: 60, padding: 12, background: '#fafafa', border: '2px dashed #d9d9d9',
                  borderRadius: 8, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {block.nodes.length === 0 && (
                  <Typography.Text type="secondary" style={{ width: '100%', textAlign: 'center' }}>
                    从左侧拖拽规则节点到此处
                  </Typography.Text>
                )}
                {block.nodes.map((node, ni) => (
                  <div key={node.id} style={{ position: 'relative' }}>
                    {ni > 0 && block.operator === 'THEN' && <ArrowRightOutlined style={{ marginRight: 4, color: '#1890ff' }} />}
                    {ni > 0 && block.operator === 'WHEN' && <span style={{ marginRight: 4, color: '#52c41a' }}>∥</span>}
                    <Tag
                      color={selectedNode?.blockIdx === bi && selectedNode?.nodeIdx === ni ? 'blue' : 'default'}
                      style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 13, borderRadius: 6,
                        border: selectedNode?.blockIdx === bi && selectedNode?.nodeIdx === ni ? '2px solid #1890ff' : '1px solid #d9d9d9' }}
                      onClick={() => selectNode(bi, ni)}
                      closable onClose={(e) => { e.preventDefault(); removeNode(bi, ni) }}>
                      <span style={{ fontWeight: 500 }}>{node.typeName}</span>
                      {node.fieldName && <span style={{ color: '#999', marginLeft: 4 }}>({node.fieldName})</span>}
                    </Tag>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Divider dashed />
          <Card size="small" title="生成的LiteFlow EL表达式" style={{ background: '#f5f5f5' }}>
            <Typography.Text code style={{ fontSize: 13, wordBreak: 'break-all' }}>
              {generateEL() || '（空）'}
            </Typography.Text>
          </Card>

          {/* Saved chains list */}
          {chains.length > 0 && (
            <>
              <Divider dashed />
              <Typography.Title level={5}>已保存的规则编排</Typography.Title>
              {chains.map(c => (
                <Card key={c.id} size="small" style={{ marginBottom: 8 }}
                  extra={<Space>
                    <Button size="small" type="link" onClick={() => loadChain(c)}>编辑</Button>
                    <Popconfirm title="确认删除？" onConfirm={async () => { await deleteRuleChain(c.id!); listRuleChains(0).then(r => setChains(r.data || [])).catch(() => {}) }}>
                      <Button size="small" type="link" danger>删除</Button>
                    </Popconfirm>
                  </Space>}>
                  <div><strong>{c.chainName}</strong> <Tag>{c.logicType}</Tag></div>
                  <Typography.Text code style={{ fontSize: 11 }}>{c.chainEl}</Typography.Text>
                </Card>
              ))}
            </>
          )}
        </Card>
      </Col>

      {/* Right: Node Properties */}
      <Col span={6}>
        <Card title="节点属性" size="small" style={{ height: '100%' }}>
          {currentNode ? (
            <Form form={nodeForm} layout="vertical" size="small">
              <div style={{ marginBottom: 12 }}>
                <Tag color="blue" style={{ fontSize: 14 }}>{currentNode.typeCode}</Tag>
                <Typography.Text strong style={{ marginLeft: 8 }}>{currentNode.typeName}</Typography.Text>
              </div>
              <Form.Item name="fieldName" label="绑定字段名">
                <Input placeholder="如 phone, id_card" />
              </Form.Item>
              <Form.Item name="params" label="规则参数 (JSON)">
                <Input.TextArea rows={4} placeholder='如 {"min":1,"max":50}' style={{ fontFamily: 'monospace', fontSize: 12 }} />
              </Form.Item>
              <Button type="primary" block onClick={updateNodeProps}>保存属性</Button>
            </Form>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <CodeOutlined style={{ fontSize: 40, marginBottom: 16 }} />
              <div>点击画布中的节点查看/编辑属性</div>
            </div>
          )}
        </Card>
      </Col>

      {/* Save chain modal */}
      <Modal title={editingChainId ? '编辑规则编排' : '保存规则编排'} open={saveModal}
        onOk={handleSave} onCancel={() => { setSaveModal(false); saveForm.resetFields(); setEditingChainId(undefined) }}
        destroyOnClose width={500}>
        <Form form={saveForm} layout="vertical">
          <Form.Item name="chainName" label="编排名称" rules={[{ required: true }]}>
            <Input placeholder="如: 用户表综合校验链" />
          </Form.Item>
          <Form.Item name="ruleGroupId" label="关联规则组" rules={[{ required: true }]}>
            <Select placeholder="选择规则组" options={groups.map(g => ({ value: g.id, label: `${g.name} (${g.tableName || ''})` }))} />
          </Form.Item>
          <Form.Item name="fieldName" label="绑定字段（可选）">
            <Input placeholder="如 phone 或留空表示整个规则组" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="规则编排描述" />
          </Form.Item>
          <Form.Item label="EL表达式（自动生成）">
            <Input.TextArea rows={2} value={generateEL()} readOnly style={{ fontFamily: 'monospace', background: '#f5f5f5' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  )
}
