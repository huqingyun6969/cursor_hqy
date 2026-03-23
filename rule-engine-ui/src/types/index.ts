export interface R<T> {
  code: number
  message: string
  data: T
}

export interface DataSourceConfig {
  id?: number
  name: string
  description?: string
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
  fieldName: string
  ruleType: string
  ruleParams?: string
  description?: string
  sortOrder: number
  status: number
  createdAt?: string
  updatedAt?: string
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
