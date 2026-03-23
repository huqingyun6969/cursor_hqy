import { useEffect, useState } from 'react'
import { Table, Button, Select, Space, Typography, Card, Tag, Modal, Progress, Divider, message } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import { listRuleGroups, generateReport, getReport, listReports } from '../api'
import type { RuleGroup, QualityReportVO, QualityReport } from '../types'

const scoreLevelMap: Record<string, { text: string; color: string }> = {
  excellent: { text: '优秀', color: '#52c41a' },
  good: { text: '良好', color: '#1890ff' },
  medium: { text: '中等', color: '#faad14' },
  poor: { text: '较差', color: '#ff4d4f' },
}

export default function ReportPage() {
  const [groups, setGroups] = useState<RuleGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<number | undefined>()
  const [generating, setGenerating] = useState(false)
  const [reports, setReports] = useState<QualityReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [reportDetail, setReportDetail] = useState<QualityReportVO | null>(null)

  useEffect(() => {
    listRuleGroups().then(r => setGroups(r.data || []))
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setReportsLoading(true)
    try { const res = await listReports(); setReports(res.data || []) }
    finally { setReportsLoading(false) }
  }

  const handleGenerate = async () => {
    if (!selectedGroup) { message.warning('请先选择规则组'); return }
    setGenerating(true)
    try {
      const res = await generateReport(selectedGroup)
      if (res.code === 200) {
        setReportDetail(res.data)
        setDetailModal(true)
        message.success('报告生成成功')
        fetchReports()
      } else { message.error(res.message) }
    } catch (e: any) { message.error(e?.response?.data?.message || '生成失败') }
    finally { setGenerating(false) }
  }

  const showDetail = async (reportId: number) => {
    const res = await getReport(reportId)
    if (res.code === 200) { setReportDetail(res.data); setDetailModal(true) }
  }

  const reportColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '表名/规则组', dataIndex: 'tableName', width: 200 },
    { title: '质量评分', dataIndex: 'totalScore', width: 120,
      render: (v: number) => <span style={{ fontWeight: 'bold', fontSize: 16, color: v >= 90 ? '#52c41a' : v >= 80 ? '#1890ff' : v >= 60 ? '#faad14' : '#ff4d4f' }}>{v}分</span> },
    { title: '等级', dataIndex: 'scoreLevel', width: 80,
      render: (v: string) => { const l = scoreLevelMap[v]; return l ? <Tag color={l.color}>{l.text}</Tag> : v }},
    { title: '数据行数', dataIndex: 'totalRows', width: 100 },
    { title: '规则数', dataIndex: 'totalRules', width: 80 },
    { title: '通过', dataIndex: 'passedRules', width: 70, render: (v: number) => <Tag color="green">{v}</Tag> },
    { title: '失败', dataIndex: 'failedRules', width: 70, render: (v: number) => <Tag color={v > 0 ? 'red' : 'green'}>{v}</Tag> },
    { title: '生成时间', dataIndex: 'createdAt', width: 180 },
    { title: '操作', width: 100, render: (_: unknown, record: QualityReport) => (
      <Button type="link" onClick={() => showDetail(record.id)}>查看详情</Button>
    )},
  ]

  const level = reportDetail ? scoreLevelMap[reportDetail.scoreLevel] : null

  return (
    <>
      <Typography.Title level={5}>质量报告</Typography.Title>
      <Card style={{ marginBottom: 24 }}>
        <Space size="large" align="center">
          <Select placeholder="选择规则组" style={{ width: 300 }} value={selectedGroup}
            onChange={setSelectedGroup} options={groups.map(g => ({ value: g.id, label: g.name }))} />
          <Button type="primary" icon={<FileTextOutlined />} onClick={handleGenerate} loading={generating} size="large">
            {generating ? '生成中...' : '生成质量报告'}
          </Button>
        </Space>
      </Card>

      <Card title={<><FileTextOutlined /> 历史报告</>}>
        <Table columns={reportColumns} dataSource={reports} rowKey="id" loading={reportsLoading} size="middle" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={`${reportDetail?.tableName || ''}表质量分详情`} open={detailModal} onCancel={() => setDetailModal(false)}
        footer={null} width={900} destroyOnClose>
        {reportDetail && (
          <>
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Progress type="circle" percent={reportDetail.totalScore} size={180}
                strokeColor={level?.color} format={() => (
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 'bold', color: level?.color }}>{reportDetail.totalScore}分</div>
                    <Tag color={level?.color} style={{ marginTop: 8 }}>{level?.text}</Tag>
                  </div>
                )} />
            </div>

            <Table size="small" pagination={false} dataSource={reportDetail.ruleDetails} rowKey={(_, i) => String(i)}
              columns={[
                { title: '校验规则', dataIndex: 'ruleType', width: 100,
                  render: (v: string, r: any) => r.ruleLevel === 'TABLE' ? '表级规则' : v },
                { title: '绑定主体', width: 180,
                  render: (_: unknown, r: any) => r.ruleLevel === 'TABLE' ? '/' : `【字段】${r.fieldLabel || r.fieldName}` },
                { title: '重要程度', dataIndex: 'importanceLevel', width: 90,
                  render: (v: string) => v === 'IMPORTANT' ? <Tag color="red">重要</Tag> : <Tag>一般</Tag> },
                { title: '规则权重', dataIndex: 'ruleWeight', width: 90 },
                { title: '规则评分', dataIndex: 'ruleScore', width: 100,
                  render: (v: number) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{v?.toFixed(2)}</span> },
              ]} />

            <Divider />
            <Typography.Title level={5}>计算方式说明：</Typography.Title>
            <Typography.Paragraph>
              1. 根据表重要程度设定权重：重要(3)，一般(1)
            </Typography.Paragraph>
            <Typography.Paragraph>
              2. 计算总权重 = {reportDetail.ruleDetails?.reduce((s, d) => s + d.ruleWeight, 0)}
            </Typography.Paragraph>
            <Typography.Paragraph>
              3. 最终得分计算公式：
            </Typography.Paragraph>
            <Card size="small" style={{ background: '#f5f5f5' }}>
              <Typography.Text code>
                {reportDetail.ruleDetails?.map((d) =>
                  `${d.ruleScore?.toFixed(2)} × (${d.ruleWeight}/${reportDetail.ruleDetails.reduce((s, dd) => s + dd.ruleWeight, 0)})`
                ).join(' + ')} = {reportDetail.totalScore}
              </Typography.Text>
            </Card>
            <Typography.Paragraph style={{ marginTop: 16 }}>
              <strong>最终结果：该表的数据质量评价得分为 {reportDetail.totalScore}，
              等级为<Tag color={level?.color}>{level?.text}</Tag></strong>
            </Typography.Paragraph>
          </>
        )}
      </Modal>
    </>
  )
}
