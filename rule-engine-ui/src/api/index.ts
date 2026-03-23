import axios from 'axios'
import type { R, DataSourceConfig, RuleGroup, RuleDefinition, RuleTypeOption, DictTable, DictItem, ExecutionRecord, ExecutionDetail, ExecutionResultVO } from '../types'

const http = axios.create({ baseURL: '/api', timeout: 60000 })

http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err)
    return Promise.reject(err)
  }
)

// DataSource
export const listDataSources = () => http.get<R<DataSourceConfig[]>>('/datasource/list').then(r => r.data)
export const getDataSource = (id: number) => http.get<R<DataSourceConfig>>(`/datasource/${id}`).then(r => r.data)
export const saveDataSource = (data: DataSourceConfig) => http.post<R<void>>('/datasource/save', data).then(r => r.data)
export const deleteDataSource = (id: number) => http.delete<R<void>>(`/datasource/${id}`).then(r => r.data)

// RuleGroup
export const listRuleGroups = () => http.get<R<RuleGroup[]>>('/rule-group/list').then(r => r.data)
export const getRuleGroup = (id: number) => http.get<R<RuleGroup>>(`/rule-group/${id}`).then(r => r.data)
export const saveRuleGroup = (data: RuleGroup) => http.post<R<void>>('/rule-group/save', data).then(r => r.data)
export const deleteRuleGroup = (id: number) => http.delete<R<void>>(`/rule-group/${id}`).then(r => r.data)

// RuleDefinition
export const listRules = (groupId: number) => http.get<R<RuleDefinition[]>>(`/rule/list/${groupId}`).then(r => r.data)
export const getRule = (id: number) => http.get<R<RuleDefinition>>(`/rule/${id}`).then(r => r.data)
export const saveRule = (data: RuleDefinition) => http.post<R<void>>('/rule/save', data).then(r => r.data)
export const deleteRule = (id: number) => http.delete<R<void>>(`/rule/${id}`).then(r => r.data)
export const listRuleTypes = () => http.get<R<RuleTypeOption[]>>('/rule/types').then(r => r.data)

// Dict
export const listDicts = () => http.get<R<DictTable[]>>('/dict/list').then(r => r.data)
export const getDictItems = (dictCode: string) => http.get<R<DictItem[]>>(`/dict/items/${dictCode}`).then(r => r.data)
export const saveDict = (data: DictTable) => http.post<R<void>>('/dict/save', data).then(r => r.data)
export const saveDictItems = (dictCode: string, items: DictItem[]) => http.post<R<void>>(`/dict/items/${dictCode}`, items).then(r => r.data)

// Execution
export const executeRuleGroup = (ruleGroupId: number) => http.post<R<ExecutionResultVO>>(`/execution/run/${ruleGroupId}`).then(r => r.data)
export const listExecutionHistory = () => http.get<R<ExecutionRecord[]>>('/execution/history').then(r => r.data)
export const getExecutionDetail = (executionId: number) => http.get<R<ExecutionDetail[]>>(`/execution/detail/${executionId}`).then(r => r.data)
