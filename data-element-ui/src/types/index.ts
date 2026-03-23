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
}

export interface RuleGroup {
  id?: number
  name: string
  description?: string
  dataSourceId: number
  tableName?: string
  tableLabel?: string
  status: number
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

export interface RuleTypeOption { value: string; label: string }

export interface RuleTypeConfig {
  id?: number
  typeCode: string
  typeName: string
  ruleLevel: string
  description?: string
  defaultParams?: string
  needsParams: number
  paramTemplate?: string
  dictCode?: string
  status: number
  sortOrder: number
}

export interface RuleChainConfig {
  id?: number
  ruleGroupId: number
  chainName: string
  fieldName?: string
  chainEl: string
  logicType: string
  description?: string
  status: number
}

export interface DictTable { id?: number; dictCode: string; dictName: string; description?: string }
export interface DictItem { id?: number; dictCode: string; itemValue: string; itemLabel?: string; sortOrder: number }

export interface ExecutionRecord {
  id: number; ruleGroupId: number; ruleGroupName: string; totalRows: number
  totalRules: number; passedRules: number; failedRules: number
  status: string; startTime: string; endTime: string; durationMs: number
}

export interface ExecutionDetail {
  id: number; executionId: number; ruleId: number; fieldName: string
  ruleType: string; ruleDescription: string; totalRows: number; violatedRows: number
  complianceRate: number; qualityResult: string; sampleViolations?: string; durationMs: number
}

export interface ExecutionResultVO {
  executionId: number; ruleGroupName: string; totalRows: number; totalRules: number
  passedRules: number; failedRules: number; status: string; durationMs: number
  details: RuleResultVO[]
}

export interface RuleResultVO {
  fieldName: string; ruleType: string; ruleDescription: string
  totalRows: number; violatedRows: number; complianceRate: number
  qualityResult: string; sampleViolations: string[]
}

export interface RuleScoreDetail {
  ruleType: string; ruleLevel: string; fieldName: string; fieldLabel: string
  importanceLevel: string; ruleWeight: number; ruleScore: number
  totalRows: number; violatedRows: number; complianceRate: number
  qualityResult: string; description: string
}

export interface QualityReportVO {
  reportId: number; tableName: string; tableLabel: string; totalScore: number
  scoreLevel: string; totalRows: number; totalRules: number
  passedRules: number; failedRules: number
  ruleDetails: RuleScoreDetail[]; scoreFormula: string; createdAt: string
}

export interface QualityReport {
  id: number; ruleGroupId: number; tableName: string; tableLabel: string
  totalScore: number; scoreLevel: string; totalRows: number
  totalRules: number; passedRules: number; failedRules: number; createdAt: string
}

export interface WorkOrder {
  id: number; orderNo: string; title: string; status: string; urgency: string
  issueType: string; reportId: number; ruleGroupId: number; tableName: string
  dataSourceUnit: string; issueDescription: string; issueImpact: string
  suggestion: string; assignee: string; createdBy: string; createdAt: string; updatedAt: string
}

export interface WorkOrderIssue {
  id: number; orderId: number; fieldName: string; fieldCode: string
  issueType: string; ruleDescription: string; issueCount: number
}

export interface WorkOrderLog {
  id: number; orderId: number; action: string; operator: string
  operatorDept: string; comment: string; createdAt: string
}

export interface WorkOrderVO extends WorkOrder {
  issues: WorkOrderIssue[]
  logs: WorkOrderLog[]
}

export interface ExecutionTask {
  id: number; ruleGroupId: number; ruleGroupName: string; status: string
  priority: number; totalRules: number; completedRules: number
  currentStep: string; progress: number; executionId: number
  threadName: string; cpuUsagePct: number; memoryUsageMb: number
  errorMessage: string; queuedAt: string; startedAt: string
  finishedAt: string; durationMs: number; createdBy: string
}

export interface ExecutionStepLog {
  id: number; taskId: number; stepIndex: number; stepName: string
  ruleId: number; fieldName: string; ruleType: string; status: string
  totalRows: number; violatedRows: number; durationMs: number
  memoryDeltaMb: number; errorMessage: string; startedAt: string; finishedAt: string
}

export interface EngineStatus {
  activeThreads: number; poolSize: number; maxPoolSize: number
  queueSize: number; queueCapacity: number; completedTasks: number
  cpuUsage: number; memoryUsedMb: number; memoryMaxMb: number
  memoryUsagePct: number; overloaded: boolean
}
