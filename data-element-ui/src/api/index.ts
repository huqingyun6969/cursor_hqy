import axios from 'axios'
import type { R, DataSourceConfig, RuleGroup, RuleDefinition, DictTable, DictItem, ExecutionRecord, ExecutionDetail, ExecutionResultVO, QualityReportVO, QualityReport, WorkOrderVO, WorkOrder, RuleTypeConfig, RuleChainConfig, ExecutionTask, ExecutionSubTask, ExecutionStepLog, EngineStatus, TaskCreateDTO } from '../types'

const http = axios.create({ baseURL: '/api', timeout: 60000 })
http.interceptors.response.use((res) => res, (err) => { console.error('API Error:', err); return Promise.reject(err) })

// DataSource
export const listDataSources = () => http.get<R<DataSourceConfig[]>>('/datasource/list').then(r => r.data)
export const getDataSource = (id: number) => http.get<R<DataSourceConfig>>(`/datasource/${id}`).then(r => r.data)
export const saveDataSource = (data: DataSourceConfig) => http.post<R<void>>('/datasource/save', data).then(r => r.data)
export const deleteDataSource = (id: number) => http.delete<R<void>>(`/datasource/${id}`).then(r => r.data)
export const testDataSource = (data: Partial<DataSourceConfig>) => http.post<R<string>>('/datasource/test', data).then(r => r.data)

// RuleGroup
export const listRuleGroups = () => http.get<R<RuleGroup[]>>('/rule-group/list').then(r => r.data)
export const getRuleGroup = (id: number) => http.get<R<RuleGroup>>(`/rule-group/${id}`).then(r => r.data)
export const saveRuleGroup = (data: RuleGroup) => http.post<R<void>>('/rule-group/save', data).then(r => r.data)
export const deleteRuleGroup = (id: number) => http.delete<R<void>>(`/rule-group/${id}`).then(r => r.data)

// RuleDefinition
export const listRules = (groupId: number) => http.get<R<RuleDefinition[]>>(`/rule/list/${groupId}`).then(r => r.data)
export const saveRule = (data: RuleDefinition) => http.post<R<void>>('/rule/save', data).then(r => r.data)
export const deleteRule = (id: number) => http.delete<R<void>>(`/rule/${id}`).then(r => r.data)

// Rule Type Config
export const listRuleTypeConfigs = () => http.get<R<RuleTypeConfig[]>>('/rule-type/list').then(r => r.data)
export const saveRuleTypeConfig = (data: RuleTypeConfig) => http.post<R<void>>('/rule-type/save', data).then(r => r.data)
export const deleteRuleTypeConfig = (id: number) => http.delete<R<void>>(`/rule-type/${id}`).then(r => r.data)

// Rule Chain
export const listRuleChains = (groupId: number) => http.get<R<RuleChainConfig[]>>(`/rule-chain/list/${groupId}`).then(r => r.data)
export const saveRuleChain = (data: RuleChainConfig) => http.post<R<void>>('/rule-chain/save', data).then(r => r.data)
export const deleteRuleChain = (id: number) => http.delete<R<void>>(`/rule-chain/${id}`).then(r => r.data)

// Dict
export const listDicts = () => http.get<R<DictTable[]>>('/dict/list').then(r => r.data)
export const getDictItems = (dictCode: string) => http.get<R<DictItem[]>>(`/dict/items/${dictCode}`).then(r => r.data)
export const saveDict = (data: DictTable) => http.post<R<void>>('/dict/save', data).then(r => r.data)
export const saveDictItems = (dictCode: string, items: DictItem[]) => http.post<R<void>>(`/dict/items/${dictCode}`, items).then(r => r.data)

// Execution (legacy)
export const executeRuleGroup = (ruleGroupId: number) => http.post<R<ExecutionResultVO>>(`/execution/run/${ruleGroupId}`).then(r => r.data)
export const listExecutionHistory = () => http.get<R<ExecutionRecord[]>>('/execution/history').then(r => r.data)
export const getExecutionDetail = (executionId: number) => http.get<R<ExecutionDetail[]>>(`/execution/detail/${executionId}`).then(r => r.data)

// Task Execution Engine (enhanced)
export const submitTaskAdvanced = (dto: TaskCreateDTO) =>
  http.post<R<ExecutionTask>>('/task/submit', dto).then(r => r.data)
export const submitTask = (ruleGroupId: number, createdBy?: string) =>
  http.post<R<ExecutionTask>>(`/task/submit/${ruleGroupId}${createdBy ? '?createdBy=' + createdBy : ''}`).then(r => r.data)
export const cancelTask = (taskId: number) => http.post<R<boolean>>(`/task/cancel/${taskId}`).then(r => r.data)
export const cancelSubTask = (subTaskId: number) => http.post<R<boolean>>(`/task/cancel-subtask/${subTaskId}`).then(r => r.data)
export const getTask = (taskId: number) => http.get<R<ExecutionTask>>(`/task/${taskId}`).then(r => r.data)
export const listTasks = (status?: string) => http.get<R<ExecutionTask[]>>(`/task/list${status ? '?status=' + status : ''}`).then(r => r.data)
export const getSubTasks = (taskId: number) => http.get<R<ExecutionSubTask[]>>(`/task/${taskId}/sub-tasks`).then(r => r.data)
export const getTaskSteps = (taskId: number) => http.get<R<ExecutionStepLog[]>>(`/task/${taskId}/steps`).then(r => r.data)
export const getEngineStatus = () => http.get<R<EngineStatus>>('/task/engine-status').then(r => r.data)
export const getSystemMetrics = () => http.get<R<Record<string, unknown>>>('/task/system-metrics').then(r => r.data)
export const updateSubTaskTimeout = (taskId: number, timeoutSec: number) =>
  http.post<R<void>>(`/task/${taskId}/update-timeout?timeoutSec=${timeoutSec}`).then(r => r.data)

// Report
export const generateReport = (ruleGroupId: number) => http.post<R<QualityReportVO>>(`/report/generate/${ruleGroupId}`).then(r => r.data)
export const getReport = (reportId: number) => http.get<R<QualityReportVO>>(`/report/${reportId}`).then(r => r.data)
export const listReports = () => http.get<R<QualityReport[]>>('/report/list').then(r => r.data)
export const exportReportPdf = (reportId: number) => {
  window.open(`/api/report/export-pdf/${reportId}`, '_blank')
}

// Work Order
export const createWorkOrder = (data: Record<string, unknown>) => http.post<R<WorkOrderVO>>('/work-order/create', data).then(r => r.data)
export const getWorkOrder = (orderId: number) => http.get<R<WorkOrderVO>>(`/work-order/${orderId}`).then(r => r.data)
export const listWorkOrders = () => http.get<R<WorkOrder[]>>('/work-order/list').then(r => r.data)
export const workOrderAction = (orderId: number, data: Record<string, unknown>) => http.post<R<void>>(`/work-order/${orderId}/action`, data).then(r => r.data)

// Dashboard
export const getDashboardStats = () => http.get<R<Record<string, unknown>>>('/dashboard/stats').then(r => r.data)

// Task violation summary
export const getViolationSummary = (taskId: number) => http.get<R<Record<string, unknown>>>(`/task/${taskId}/violation-summary`).then(r => r.data)

// Violations (异常数据)
export const listViolations = (params: { taskId?: number; detailId?: number; fieldName?: string; current?: number; size?: number }) =>
  http.get<R<Record<string, unknown>>>('/violation/list', { params }).then(r => r.data)
export const countViolations = (params: { taskId?: number; detailId?: number }) =>
  http.get<R<number>>('/violation/count', { params }).then(r => r.data)

// Generate report for a task
export const generateReportForTask = (ruleGroupId: number) =>
  http.post<R<QualityReportVO>>(`/report/generate/${ruleGroupId}`).then(r => r.data)
