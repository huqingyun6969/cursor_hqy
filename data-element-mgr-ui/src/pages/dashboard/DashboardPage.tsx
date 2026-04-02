import React, { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Card, Row, Col, Table, Typography, Space, Button, Tag, Badge } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExportOutlined,
  WarningFilled,
  FundOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getDashboardLatest, getTopStandards, getTopDiversity, getUnlandedPage } from '../../api/standard'

const { Text } = Typography

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StatCard {
  title: string
  value: string | number
  suffix?: string
  trend: 'up' | 'down'
  trendLabel: string
  trendValue: string
  color: string
  bgGradient: string
  iconBg: string
}

interface TopStandard {
  rank: number
  code: string
  name: string
  coverCount: number
}

interface TopDiversity {
  rank: number
  tableName: string
  system: string
  stdCount: number
}

interface UnlandedStandard {
  id: number
  code: string
  name: string
  category: string
  publishDate: string
  status: string
}

interface UnlinkedTable {
  id: number
  tableName: string
  system: string
  fieldCount: number
  createDate: string
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const defaultStats: StatCard[] = [
  {
    title: '标准落地率',
    value: '72.0',
    suffix: '%',
    trend: 'up',
    trendLabel: '较上月',
    trendValue: '3.2%',
    color: '#1677ff',
    bgGradient: 'linear-gradient(135deg, #e8f4ff 0%, #f0f7ff 100%)',
    iconBg: 'rgba(22,119,255,0.1)',
  },
  {
    title: '落标库表数',
    value: 123,
    trend: 'up',
    trendLabel: '较上月',
    trendValue: '12',
    color: '#52c41a',
    bgGradient: 'linear-gradient(135deg, #f0fff0 0%, #f6ffed 100%)',
    iconBg: 'rgba(82,196,26,0.1)',
  },
  {
    title: '已覆盖标准',
    value: 1223,
    trend: 'up',
    trendLabel: '较上周',
    trendValue: '5.8%',
    color: '#722ed1',
    bgGradient: 'linear-gradient(135deg, #f5f0ff 0%, #f9f5ff 100%)',
    iconBg: 'rgba(114,46,209,0.1)',
  },
  {
    title: '未落地标准',
    value: 85,
    trend: 'down',
    trendLabel: '较上月',
    trendValue: '2.1%',
    color: '#fa8c16',
    bgGradient: 'linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)',
    iconBg: 'rgba(250,140,22,0.1)',
  },
]

const defaultTopStandards: TopStandard[] = [
  { rank: 1, code: 'STD-2024-001', name: '客户基本信息标准', coverCount: 56 },
  { rank: 2, code: 'STD-2024-002', name: '账户信息标准', coverCount: 48 },
  { rank: 3, code: 'STD-2024-003', name: '交易流水标准', coverCount: 42 },
  { rank: 4, code: 'STD-2024-004', name: '产品信息标准', coverCount: 38 },
  { rank: 5, code: 'STD-2024-005', name: '机构信息标准', coverCount: 35 },
  { rank: 6, code: 'STD-2024-006', name: '员工信息标准', coverCount: 31 },
  { rank: 7, code: 'STD-2024-007', name: '合同信息标准', coverCount: 28 },
  { rank: 8, code: 'STD-2024-008', name: '风控数据标准', coverCount: 25 },
  { rank: 9, code: 'STD-2024-009', name: '渠道信息标准', coverCount: 22 },
  { rank: 10, code: 'STD-2024-010', name: '营销数据标准', coverCount: 18 },
]

const defaultTopDiversity: TopDiversity[] = [
  { rank: 1, tableName: 'T_CIF_CLIENT_INFO', system: '核心系统/客户域', stdCount: 24 },
  { rank: 2, tableName: 'T_ACC_ACCOUNT_MAIN', system: '核心系统/账户域', stdCount: 21 },
  { rank: 3, tableName: 'T_TXN_TRADE_DETAIL', system: '交易系统/交易域', stdCount: 18 },
  { rank: 4, tableName: 'T_PRD_PRODUCT_BASE', system: '产品系统/产品域', stdCount: 16 },
  { rank: 5, tableName: 'T_ORG_BRANCH_INFO', system: '机构系统/组织域', stdCount: 14 },
  { rank: 6, tableName: 'T_EMP_STAFF_BASE', system: '人力系统/员工域', stdCount: 13 },
  { rank: 7, tableName: 'T_CNT_CONTRACT_BASE', system: '信贷系统/合同域', stdCount: 11 },
  { rank: 8, tableName: 'T_RSK_RISK_EVAL', system: '风控系统/风险域', stdCount: 10 },
  { rank: 9, tableName: 'T_CHN_CHANNEL_LOG', system: '渠道系统/渠道域', stdCount: 9 },
  { rank: 10, tableName: 'T_MKT_CAMPAIGN_REC', system: '营销系统/营销域', stdCount: 7 },
]

const defaultUnlanded: UnlandedStandard[] = [
  { id: 1, code: 'STD-2024-050', name: '反洗钱数据标准', category: '监管合规', publishDate: '2024-03-15', status: '未落地' },
  { id: 2, code: 'STD-2024-051', name: '跨境支付标准', category: '支付清算', publishDate: '2024-03-10', status: '未落地' },
  { id: 3, code: 'STD-2024-052', name: '数据安全分级标准', category: '数据安全', publishDate: '2024-02-28', status: '未落地' },
  { id: 4, code: 'STD-2024-053', name: '隐私计算标准', category: '数据安全', publishDate: '2024-02-20', status: '未落地' },
  { id: 5, code: 'STD-2024-054', name: '数据资产评估标准', category: '数据资产', publishDate: '2024-02-15', status: '未落地' },
]

const defaultUnlinked: UnlinkedTable[] = [
  { id: 1, tableName: 'T_LOG_SYS_OPERATE', system: '日志系统/运维域', fieldCount: 32, createDate: '2024-01-10' },
  { id: 2, tableName: 'T_TMP_DATA_STAGE', system: '临时库/暂存域', fieldCount: 28, createDate: '2024-01-08' },
  { id: 3, tableName: 'T_RPT_DAILY_SUM', system: '报表系统/统计域', fieldCount: 45, createDate: '2024-01-05' },
  { id: 4, tableName: 'T_BAK_HIST_ARCHIVE', system: '归档系统/历史域', fieldCount: 20, createDate: '2023-12-20' },
  { id: 5, tableName: 'T_ETL_JOB_CONFIG', system: 'ETL系统/调度域', fieldCount: 15, createDate: '2023-12-15' },
]

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const sectionCardStyle: CSSProperties = {
  borderRadius: 8,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  border: '1px solid #f0f0f0',
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: '#1d2129',
  margin: 0,
}

const rankBadge = (rank: number): CSSProperties => {
  const bg = rank <= 3 ? ['#1677ff', '#3b8cff', '#69a8ff'][rank - 1] : '#e8e8e8'
  const color = rank <= 3 ? '#fff' : '#666'
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    background: bg,
    color,
  }
}

/* ------------------------------------------------------------------ */
/*  Mini sparkline SVG                                                 */
/* ------------------------------------------------------------------ */

const Sparkline: React.FC<{ color: string; trend: 'up' | 'down' }> = ({ color, trend }) => {
  const upPath = 'M0,28 L8,22 L16,25 L24,18 L32,20 L40,12 L48,8'
  const downPath = 'M0,8 L8,14 L16,11 L24,18 L32,16 L40,22 L48,28'
  return (
    <svg width="56" height="36" viewBox="0 0 56 36" fill="none" style={{ opacity: 0.7 }}>
      <path
        d={trend === 'up' ? upPath : downPath}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle
        cx={48}
        cy={trend === 'up' ? 8 : 28}
        r="3"
        fill={color}
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  StatCardItem                                                       */
/* ------------------------------------------------------------------ */

const StatCardItem: React.FC<{ stat: StatCard }> = ({ stat }) => (
  <Card
    bodyStyle={{ padding: '20px 24px' }}
    style={{
      borderRadius: 10,
      border: 'none',
      background: stat.bgGradient,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      height: '100%',
    }}
    hoverable
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: '#86909c' }}>{stat.title}</Text>
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: stat.color, lineHeight: 1 }}>
            {stat.value}
          </span>
          {stat.suffix && (
            <span style={{ fontSize: 16, fontWeight: 600, color: stat.color, marginLeft: 2 }}>
              {stat.suffix}
            </span>
          )}
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 12, color: '#86909c' }}>{stat.trendLabel}</Text>
          {stat.trend === 'up' ? (
            <ArrowUpOutlined style={{ fontSize: 11, color: '#52c41a' }} />
          ) : (
            <ArrowDownOutlined style={{ fontSize: 11, color: '#f5222d' }} />
          )}
          <Text style={{ fontSize: 12, color: stat.trend === 'up' ? '#52c41a' : '#f5222d', fontWeight: 500 }}>
            {stat.trendValue}
          </Text>
        </div>
      </div>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 12,
          background: stat.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Sparkline color={stat.color} trend={stat.trend} />
      </div>
    </div>
  </Card>
)

/* ------------------------------------------------------------------ */
/*  BarCell — inline horizontal bar for coverage column                */
/* ------------------------------------------------------------------ */

const BarCell: React.FC<{ value: number; max: number }> = ({ value, max }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#f0f0f0' }}>
      <div
        style={{
          width: `${(value / max) * 100}%`,
          height: '100%',
          borderRadius: 4,
          background: 'linear-gradient(90deg, #1677ff, #69b1ff)',
          transition: 'width 0.6s ease',
        }}
      />
    </div>
    <Text style={{ fontSize: 13, fontWeight: 500, color: '#1d2129', minWidth: 28, textAlign: 'right' }}>
      {value}
    </Text>
  </div>
)

/* ------------------------------------------------------------------ */
/*  WarningBanner                                                      */
/* ------------------------------------------------------------------ */

const WarningBanner: React.FC<{ text: string; count: number }> = ({ text, count }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderRadius: 6,
      background: '#fffbe6',
      border: '1px solid #ffe58f',
      marginBottom: 12,
    }}
  >
    <WarningFilled style={{ color: '#faad14', fontSize: 14 }} />
    <Text style={{ fontSize: 13, color: '#8c6d1f' }}>
      {text}
      <span style={{ fontWeight: 600, color: '#d48806', margin: '0 4px' }}>{count}</span>
      条记录需要关注
    </Text>
  </div>
)

/* ------------------------------------------------------------------ */
/*  DashboardPage                                                      */
/* ------------------------------------------------------------------ */

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>(defaultStats)
  const [topStandards, setTopStandards] = useState<TopStandard[]>(defaultTopStandards)
  const [topDiversity, setTopDiversity] = useState<TopDiversity[]>(defaultTopDiversity)
  const [unlanded, setUnlanded] = useState<UnlandedStandard[]>(defaultUnlanded)
  const [unlinked] = useState<UnlinkedTable[]>(defaultUnlinked)

  useEffect(() => {
    getDashboardLatest()
      .then((res: any) => {
        if (res?.data) {
          const d = res.data
          setStats(prev =>
            prev.map((s, i) => {
              const apiValues = [d.landingRate, d.tableCount, d.coveredCount, d.unlandedCount]
              const apiTrends = [d.landingRateTrend, d.tableCountTrend, d.coveredTrend, d.unlandedTrend]
              return apiValues[i] != null
                ? { ...s, value: apiValues[i], trendValue: apiTrends[i] ?? s.trendValue }
                : s
            }),
          )
        }
      })
      .catch(() => {})

    getTopStandards()
      .then((res: any) => { if (res?.data) setTopStandards(res.data) })
      .catch(() => {})

    getTopDiversity()
      .then((res: any) => { if (res?.data) setTopDiversity(res.data) })
      .catch(() => {})

    getUnlandedPage({ page: 1, size: 5 })
      .then((res: any) => { if (res?.data?.records) setUnlanded(res.data.records) })
      .catch(() => {})
  }, [])

  /* ---------- column definitions ---------- */

  const maxCover = Math.max(...topStandards.map(s => s.coverCount), 1)

  const topStdColumns: ColumnsType<TopStandard> = [
    {
      title: '排名',
      dataIndex: 'rank',
      width: 60,
      align: 'center',
      render: (v: number) => <span style={rankBadge(v)}>{v}</span>,
    },
    { title: '标准编号', dataIndex: 'code', width: 140 },
    { title: '标准名称', dataIndex: 'name', ellipsis: true },
    {
      title: '覆盖表数',
      dataIndex: 'coverCount',
      width: 180,
      render: (v: number) => <BarCell value={v} max={maxCover} />,
    },
  ]

  const diversityColumns: ColumnsType<TopDiversity> = [
    {
      title: '排名',
      dataIndex: 'rank',
      width: 60,
      align: 'center',
      render: (v: number) => <span style={rankBadge(v)}>{v}</span>,
    },
    { title: '表名', dataIndex: 'tableName', width: 200, ellipsis: true },
    { title: '所属系统/目录', dataIndex: 'system', ellipsis: true },
    {
      title: '关联标准数',
      dataIndex: 'stdCount',
      width: 100,
      align: 'center',
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '操作',
      width: 120,
      align: 'center',
      render: () => (
        <Button type="link" size="small" style={{ padding: 0, fontSize: 13 }}>
          预览落标映射
        </Button>
      ),
    },
  ]

  const unlandedColumns: ColumnsType<UnlandedStandard> = [
    { title: '标准编号', dataIndex: 'code', width: 140 },
    { title: '标准名称', dataIndex: 'name', ellipsis: true },
    { title: '分类', dataIndex: 'category', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: '发布日期', dataIndex: 'publishDate', width: 110 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      align: 'center',
      render: (v: string) => <Badge status="warning" text={<Text style={{ fontSize: 13 }}>{v}</Text>} />,
    },
  ]

  const unlinkedColumns: ColumnsType<UnlinkedTable> = [
    { title: '表名', dataIndex: 'tableName', width: 200, ellipsis: true },
    { title: '所属系统/目录', dataIndex: 'system', ellipsis: true },
    {
      title: '字段数',
      dataIndex: 'fieldCount',
      width: 80,
      align: 'center',
      render: (v: number) => <Tag color="cyan">{v}</Tag>,
    },
    { title: '创建日期', dataIndex: 'createDate', width: 110 },
  ]

  /* ---------- render ---------- */

  return (
    <div style={{ minHeight: '100%' }}>
      {/* -------- Stat Cards -------- */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {stats.map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <StatCardItem stat={stat} />
          </Col>
        ))}
      </Row>

      {/* -------- TOP10 Tables -------- */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: '#1677ff' }} />
                <span style={sectionTitleStyle}>TOP10高覆盖标准</span>
              </Space>
            }
            style={sectionCardStyle}
            bodyStyle={{ padding: '0 0 8px' }}
          >
            <Table<TopStandard>
              columns={topStdColumns}
              dataSource={topStandards}
              rowKey="rank"
              pagination={false}
              size="small"
              style={{ margin: '0 8px' }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FundOutlined style={{ color: '#722ed1' }} />
                <span style={sectionTitleStyle}>TOP10高标准多样性表</span>
              </Space>
            }
            style={sectionCardStyle}
            bodyStyle={{ padding: '0 0 8px' }}
          >
            <Table<TopDiversity>
              columns={diversityColumns}
              dataSource={topDiversity}
              rowKey="rank"
              pagination={false}
              size="small"
              style={{ margin: '0 8px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* -------- Bottom Tables -------- */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RiseOutlined style={{ color: '#fa8c16' }} />
                <span style={sectionTitleStyle}>未落地标准列表</span>
              </Space>
            }
            extra={
              <Button icon={<ExportOutlined />} size="small">
                导出
              </Button>
            }
            style={sectionCardStyle}
            bodyStyle={{ padding: '12px 16px 8px' }}
          >
            <WarningBanner text="当前有" count={unlanded.length} />
            <Table<UnlandedStandard>
              columns={unlandedColumns}
              dataSource={unlanded}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FallOutlined style={{ color: '#f5222d' }} />
                <span style={sectionTitleStyle}>未关联任何标准业务表</span>
              </Space>
            }
            extra={
              <Button icon={<ExportOutlined />} size="small">
                导出
              </Button>
            }
            style={sectionCardStyle}
            bodyStyle={{ padding: '12px 16px 8px' }}
          >
            <WarningBanner text="当前有" count={unlinked.length} />
            <Table<UnlinkedTable>
              columns={unlinkedColumns}
              dataSource={unlinked}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
