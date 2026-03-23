export interface R<T> {
  code: number
  message: string
  data: T
}

export type DbType = 'MYSQL' | 'ORACLE' | 'HIVE'

export interface DataSourceConfig {
  id?: number
  name: string
  description?: string
  dbType: DbType
  dbUrl: string
  dbUsername: string
  dbPassword: string
  tableName: string
  querySql?: string
  status: number
  createdAt?: string
  updatedAt?: string
}

export interface RuleGroup {
  id?: number
  name: string
  description?: string
  dataSourceId: number
  status: number
  createdAt?: string
  updatedAt?: string
}

export interface RuleDefinition {
  id?: number
  ruleGroupId: number
  ruleLevel: string
  fieldName: string
  ruleType: string
  ruleParams?: string
  customSql?: string
  description?: string
  importanceLevel: string
  ruleWeight: number
  sortOrder: number
  status: number
}

export interface RuleTypeOption {
  value: string
  label: string
}

export interface DictTable {
  id?: number
  dictCode: string
  dictName: string
  description?: string
}

export interface DictItem {
  id?: number
  dictCode: string
  itemValue: string
  itemLabel?: string
  sortOrder: number
}

export interface ExecutionRecord {
  id: number
  ruleGroupId: number
  ruleGroupName: string
  totalRows: number
  totalRules: number
  passedRules: number
  failedRules: number
  status: string
  startTime: string
  endTime: string
  durationMs: number
}

export interface ExecutionDetail {
  id: number
  executionId: number
  ruleId: number
  fieldName: string
  ruleType: string
  ruleDescription: string
  totalRows: number
  violatedRows: number
  complianceRate: number
  qualityResult: string
  sampleViolations?: string
  durationMs: number
}

export interface ExecutionResultVO {
  executionId: number
  ruleGroupName: string
  totalRows: number
  totalRules: number
  passedRules: number
  failedRules: number
  status: string
  durationMs: number
  details: RuleResultVO[]
}

export interface RuleResultVO {
  fieldName: string
  ruleType: string
  ruleDescription: string
  totalRows: number
  violatedRows: number
  complianceRate: number
  qualityResult: string
  sampleViolations: string[]
}

export interface RuleScoreDetail {
  ruleType: string
  ruleLevel: string
  fieldName: string
  fieldLabel: string
  importanceLevel: string
  ruleWeight: number
  ruleScore: number
  totalRows: number
  violatedRows: number
  complianceRate: number
  qualityResult: string
  description: string
}

export interface QualityReportVO {
  reportId: number
  tableName: string
  tableLabel: string
  totalScore: number
  scoreLevel: string
  totalRows: number
  totalRules: number
  passedRules: number
  failedRules: number
  ruleDetails: RuleScoreDetail[]
  scoreFormula: string
  createdAt: string
}

export interface QualityReport {
  id: number
  ruleGroupId: number
  tableName: string
  tableLabel: string
  totalScore: number
  scoreLevel: string
  totalRows: number
  totalRules: number
  passedRules: number
  failedRules: number
  createdAt: string
}

export interface WorkOrder {
  id: number
  orderNo: string
  title: string
  status: string
  urgency: string
  issueType: string
  reportId: number
  ruleGroupId: number
  tableName: string
  dataSourceUnit: string
  issueDescription: string
  issueImpact: string
  suggestion: string
  assignee: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface WorkOrderIssue {
  id: number
  orderId: number
  fieldName: string
  fieldCode: string
  issueType: string
  ruleDescription: string
  issueCount: number
}

export interface WorkOrderLog {
  id: number
  orderId: number
  action: string
  operator: string
  operatorDept: string
  comment: string
  createdAt: string
}

export interface WorkOrderVO extends WorkOrder {
  issues: WorkOrderIssue[]
  logs: WorkOrderLog[]
}
