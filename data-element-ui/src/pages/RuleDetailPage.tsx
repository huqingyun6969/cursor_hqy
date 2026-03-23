import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, message, Typography, Card, Tag, Alert, Divider } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, CodeOutlined } from '@ant-design/icons'
import { listRules, saveRule, deleteRule, listRuleTypeConfigs, getRuleGroup } from '../api'
import type { RuleDefinition, RuleTypeConfig, RuleGroup } from '../types'

const SCRIPT_JS_EXAMPLE = `// ===== JavaScript 动态脚本 (GraalJS引擎, 支持ES6) =====
// 后台通过 LiteFlow 动态加载此脚本执行
// 通过 RuleContext 获取数据行，遍历判断，设置违规数

var RuleContext = Java.type("com.iwhalecloud.dep.runengine.liteflow.context.RuleContext");
var ctx = this.getContextBean(RuleContext.class);
var fieldName = ctx.getCurrentRule().getFieldName();
var rows = ctx.getDataRows();

var violated = 0;
for (var i = 0; i < rows.size(); i++) {
    var value = rows.get(i).get(fieldName);
    // 示例逻辑：检查字段值不为空且长度>=2
    if (value == null || value.toString().trim().length() < 2) {
        violated++;
        ctx.addViolation("字段[" + fieldName + "]值不合规: " + value);
    }
}
ctx.setViolatedRows(violated);`

const SCRIPT_JAVA_EXAMPLE = `// ===== Java 动态脚本 (javax-pro引擎, 推荐) =====
// 后台通过 LiteFlow 动态加载此脚本执行
// 继承 NodeComponent，在 process() 中编写校验逻辑

import com.iwhalecloud.dep.runengine.liteflow.context.RuleContext;
import com.yomahub.liteflow.core.NodeComponent;
import java.util.List;
import java.util.Map;

public class Demo extends NodeComponent {
    @Override
    public void process() throws Exception {
        // 获取规则上下文
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        List<Map<String, Object>> rows = ctx.getDataRows();

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            // 示例逻辑：检查字段值不为空且长度>=2
            if (value == null || value.toString().trim().isEmpty()
                    || value.toString().trim().length() < 2) {
                violated++;
                ctx.addViolation("字段[" + fieldName + "]值不合规: " + value);
            }
        }
        // 设置违规行数（必须调用）
        ctx.setViolatedRows(violated);
    }
}`

export default function RuleDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const [rules, setRules] = useState<RuleDefinition[]>([])
  const [ruleTypes, setRuleTypes] = useState<RuleTypeConfig[]>([])
  const [group, setGroup] = useState<RuleGroup | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | undefined>()
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('FIELD')

  const gid = Number(groupId)
  const isScriptType = selectedType === 'SCRIPT'

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rulesRes, typesRes, groupRes] = await Promise.all([listRules(gid), listRuleTypeConfigs(), getRuleGroup(gid)])
      setRules(rulesRes.data || [])
      setRuleTypes(typesRes.data || [])
      setGroup(groupRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [groupId])

  const handleSave = async () => {
    const values = await form.validateFields()
    const weight = values.importanceLevel === 'IMPORTANT' ? 3 : 1
    await saveRule({ ...values, id: editingId, ruleGroupId: gid, ruleWeight: values.ruleWeight ?? weight,
      status: values.status ?? 1, sortOrder: values.sortOrder ?? 0,
      ruleLevel: values.ruleLevel ?? 'FIELD', importanceLevel: values.importanceLevel ?? 'NORMAL' })
    message.success('保存成功')
    setModalOpen(false)
    form.resetFields()
    setEditingId(undefined)
    fetchData()
  }

  const handleEdit = (record: RuleDefinition) => {
    setEditingId(record.id)
    setSelectedType(record.ruleType)
    setSelectedLevel(record.ruleLevel || 'FIELD')
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    await deleteRule(id)
    message.success('删除成功')
    fetchData()
  }

  const typeMap = new Map(ruleTypes.map(t => [t.typeCode, t.typeName]))
  const typeConfigMap = new Map(ruleTypes.map(t => [t.typeCode, t]))

  const columns = [
    { title: '序号', dataIndex: 'sortOrder', width: 50 },
    { title: '规则级别', dataIndex: 'ruleLevel', width: 80,
      render: (v: string) => v === 'TABLE' ? <Tag color="purple">表级</Tag> : <Tag color="cyan">字段级</Tag> },
    { title: '字段名', dataIndex: 'fieldName', width: 130 },
    { title: '规则类型', dataIndex: 'ruleType', width: 130,
      render: (v: string) => <Tag color={v === 'SCRIPT' ? 'geekblue' : 'blue'}>{typeMap.get(v) || v}</Tag> },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '重要程度', dataIndex: 'importanceLevel', width: 80,
      render: (v: string) => v === 'IMPORTANT' ? <Tag color="red">重要</Tag> : <Tag>一般</Tag> },
    { title: '权重', dataIndex: 'ruleWeight', width: 50 },
    { title: '脚本', dataIndex: 'scriptBody', width: 70,
      render: (v: string, r: RuleDefinition) => v ? <Tag color="geekblue" icon={<CodeOutlined />}>{r.scriptLanguage || 'java'}</Tag> : '-' },
    { title: '状态', dataIndex: 'status', width: 60,
      render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    { title: '操作', width: 140, render: (_: unknown, record: RuleDefinition) => (
      <Space>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id!)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/rule-group')}>返回</Button>
        <Typography.Title level={5} style={{ margin: 0 }}>
          数据标准: {group?.name || groupId} {group?.tableName && <Tag>{group.tableName}</Tag>}
        </Typography.Title>
      </Space>
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>共 <strong>{rules.length}</strong> 条规则</span>
          <Button type="primary" icon={<PlusOutlined />}
            onClick={() => { form.resetFields(); setEditingId(undefined); setSelectedType(''); setSelectedLevel('FIELD'); setModalOpen(true) }}>
            关联规则
          </Button>
        </div>
      </Card>
      <Table columns={columns} dataSource={rules} rowKey="id" loading={loading} size="small" pagination={{ pageSize: 20 }} />

      <Modal title={editingId ? '编辑规则' : '关联规则'} open={modalOpen}
        onOk={handleSave} onCancel={() => { setModalOpen(false); form.resetFields() }}
        width={800} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="ruleLevel" label="规则级别" initialValue="FIELD" rules={[{ required: true }]}>
            <Select onChange={(v) => setSelectedLevel(v)} options={[
              { value: 'TABLE', label: '表级规则' },
              { value: 'FIELD', label: '字段级规则' },
            ]} />
          </Form.Item>
          <Form.Item name="fieldName" label={selectedLevel === 'TABLE' ? '表名/标识' : '字段名'} rules={[{ required: true }]}>
            <Input placeholder={selectedLevel === 'TABLE' ? '表标识，如 /' : '数据库字段名称，如 CORPNAME'} />
          </Form.Item>
          <Form.Item name="ruleType" label="规则类型" rules={[{ required: true }]}>
            <Select placeholder="选择规则类型" showSearch optionFilterProp="label"
              options={ruleTypes.filter(t => t.status === 1).map(t => ({
                value: t.typeCode,
                label: `${t.typeName} (${t.typeCode})`,
              }))}
              onChange={(v: string) => {
                setSelectedType(v)
                const cfg = typeConfigMap.get(v)
                if (cfg && !cfg.needsParams) {
                  form.setFieldsValue({ ruleParams: '{}' })
                }
                if (v === 'SCRIPT') {
                  form.setFieldsValue({ scriptLanguage: 'java' })
                }
              }} />
          </Form.Item>
          <Form.Item name="description" label="规则描述">
            <Input.TextArea placeholder="例: CORPNAME重复率=0%" rows={2} />
          </Form.Item>

          {/* Script-specific fields */}
          {isScriptType && (
            <>
              <Alert type="info" showIcon style={{ marginBottom: 16 }}
                message="动态脚本规则"
                description="选择脚本语言后，在下方代码编辑区编写校验逻辑。脚本中通过 RuleContext 获取数据行并设置违规数。" />
              <Form.Item name="scriptLanguage" label="脚本语言" rules={[{ required: isScriptType, message: '请选择脚本语言' }]}>
                <Select options={[
                  { value: 'java', label: 'Java (javax-pro引擎，推荐)' },
                  { value: 'js', label: 'JavaScript (GraalJS引擎，支持ES6)' },
                ]} />
              </Form.Item>
              <Form.Item name="scriptBody" label={
                <Space>
                  <span>脚本代码</span>
                  <Button size="small" type="link" onClick={() => {
                    const lang = form.getFieldValue('scriptLanguage') || 'java'
                    form.setFieldsValue({ scriptBody: lang === 'js' ? SCRIPT_JS_EXAMPLE : SCRIPT_JAVA_EXAMPLE })
                  }}>插入示例代码</Button>
                </Space>
              } rules={[{ required: isScriptType, message: '请编写脚本代码' }]}>
                <Input.TextArea
                  rows={14}
                  style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace', fontSize: 13, background: '#1e1e1e', color: '#d4d4d4' }}
                  placeholder="在此编写校验脚本代码..." />
              </Form.Item>
            </>
          )}

          {/* Standard rule params */}
          {!isScriptType && (
            <>
              <Form.Item name="ruleParams" label={
                <span>规则参数 (JSON)
                  {selectedType && (() => {
                    const cfg = typeConfigMap.get(selectedType)
                    const hint = cfg?.needsParams ? cfg.paramTemplate : '无需参数(默认{})'
                    return <Typography.Text type="secondary" style={{ marginLeft: 8 }}>提示: {hint}</Typography.Text>
                  })()}
                </span>
              }>
                <Input.TextArea placeholder='例如: {"min":3,"max":50}' rows={2} />
              </Form.Item>

              {selectedType === 'CUSTOM_SQL' && (
                <Alert type="info" showIcon style={{ marginBottom: 16 }}
                  message="自定义SQL校验使用说明"
                  description={
                    <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                      在下方输入条件表达式，系统对每行数据逐行判断（TRUE=通过，FALSE=违规）：<br/>
                      <code>IS NOT NULL</code> — 字段不为空则通过<br/>
                      <code>LENGTH(field) &gt; 10</code> — 字段长度&gt;10则通过<br/>
                      <code>LIKE &apos;%@%.com&apos;</code> — 匹配模式则通过<br/>
                      <code>IN (&apos;男&apos;,&apos;女&apos;)</code> — 值在列表中则通过<br/>
                      <code>COUNT: IS NULL</code> — 计数模式：空值的行算作违规
                    </div>
                  } />
              )}

              <Form.Item name="customSql" label="自定义SQL / 条件表达式"
                extra={selectedType === 'CUSTOM_SQL' ? '必填：输入条件表达式，如 IS NOT NULL 或 LENGTH(field) > 5' : '可选：仅CUSTOM_SQL类型需要填写'}>
                <Input.TextArea
                  placeholder={selectedType === 'CUSTOM_SQL'
                    ? '示例1: IS NOT NULL\n示例2: LENGTH(field) > 10\n示例3: IN (\'男\',\'女\',\'未知\')\n示例4: LIKE \'%@%\''
                    : 'SELECT COUNT(*) FROM table WHERE ...'}
                  rows={selectedType === 'CUSTOM_SQL' ? 4 : 3}
                  style={selectedType === 'CUSTOM_SQL' ? { fontFamily: 'monospace' } : undefined} />
              </Form.Item>
            </>
          )}

          <Form.Item name="importanceLevel" label="重要程度" initialValue="NORMAL">
            <Select onChange={(v) => { form.setFieldsValue({ ruleWeight: v === 'IMPORTANT' ? 3 : 1 }) }}
              options={[
                { value: 'IMPORTANT', label: '重要 (权重默认3)' },
                { value: 'NORMAL', label: '一般 (权重默认1)' },
              ]} />
          </Form.Item>
          <Form.Item name="ruleWeight" label="权重" initialValue={1}>
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序号" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
