import request from '../utils/request'

// 标准集目录
export const getCatalogTree = () => request.get('/std/catalog/tree')
export const createCatalog = (data: any) => request.post('/std/catalog', data)
export const updateCatalog = (id: number, data: any) => request.put(`/std/catalog/${id}`, data)
export const deleteCatalog = (id: number) => request.delete(`/std/catalog/${id}`)

// 标准文档
export const getDocumentPage = (params: any) => request.get('/std/document/page', { params })
export const getDocument = (id: number) => request.get(`/std/document/${id}`)
export const createDocument = (data: any) => request.post('/std/document', data)
export const updateDocument = (id: number, data: any) => request.put(`/std/document/${id}`, data)
export const deleteDocument = (id: number) => request.delete(`/std/document/${id}`)
export const submitDocument = (id: number) => request.post(`/std/document/${id}/submit`)
export const approveDocument = (id: number, remark: string) => request.post(`/std/document/${id}/approve`, null, { params: { remark } })
export const rejectDocument = (id: number, remark: string) => request.post(`/std/document/${id}/reject`, null, { params: { remark } })

// 文档细则
export const getDocRules = (documentId: number) => request.get('/std/doc-rule/list', { params: { documentId } })
export const createDocRule = (data: any) => request.post('/std/doc-rule', data)
export const updateDocRule = (id: number, data: any) => request.put(`/std/doc-rule/${id}`, data)
export const deleteDocRule = (id: number) => request.delete(`/std/doc-rule/${id}`)

// 审批记录
export const getApprovals = (documentId: number) => request.get('/std/approval/list', { params: { documentId } })

// 数据标准集
export const getStdSetPage = (params: any) => request.get('/std/set/page', { params })
export const getStdSet = (id: number) => request.get(`/std/set/${id}`)
export const createStdSet = (data: any) => request.post('/std/set', data)
export const updateStdSet = (id: number, data: any) => request.put(`/std/set/${id}`, data)
export const deleteStdSet = (id: number) => request.delete(`/std/set/${id}`)

// 数据标准
export const getStdInfoPage = (params: any) => request.get('/std/info/page', { params })
export const getStdInfo = (id: number) => request.get(`/std/info/${id}`)
export const createStdInfo = (data: any) => request.post('/std/info', data)
export const updateStdInfo = (id: number, data: any) => request.put(`/std/info/${id}`, data)
export const deleteStdInfo = (id: number) => request.delete(`/std/info/${id}`)

// 落标规则
export const getStdRules = (stdInfoId: number) => request.get('/std/rule/list', { params: { stdInfoId } })
export const createStdRule = (data: any) => request.post('/std/rule', data)
export const updateStdRule = (id: number, data: any) => request.put(`/std/rule/${id}`, data)
export const deleteStdRule = (id: number) => request.delete(`/std/rule/${id}`)

// 关联标准文档
export const getRefDocs = (stdInfoId: number) => request.get('/std/ref-doc/list', { params: { stdInfoId } })
export const createRefDoc = (data: any) => request.post('/std/ref-doc', data)
export const deleteRefDoc = (id: number) => request.delete(`/std/ref-doc/${id}`)

// 落标映射
export const getMapResourcePage = (params: any) => request.get('/map/resource/page', { params })
export const getMapResource = (id: number) => request.get(`/map/resource/${id}`)
export const createMapResource = (data: any) => request.post('/map/resource', data)
export const updateMapResource = (id: number, data: any) => request.put(`/map/resource/${id}`, data)
export const deleteMapResource = (id: number) => request.delete(`/map/resource/${id}`)

// 字段映射
export const getMapFields = (resourceId: number) => request.get('/map/field/list', { params: { resourceId } })
export const createMapField = (data: any) => request.post('/map/field', data)
export const updateMapField = (id: number, data: any) => request.put(`/map/field/${id}`, data)
export const deleteMapField = (id: number) => request.delete(`/map/field/${id}`)
export const batchMapFields = (data: any[]) => request.post('/map/field/batch', data)

// Dashboard
export const getDashboardLatest = () => request.get('/std/dashboard/latest')
export const getTopStandards = () => request.get('/std/dashboard/top-standards')
export const getTopDiversity = () => request.get('/std/dashboard/top-diversity')
export const getUnlandedPage = (params: any) => request.get('/std/dashboard/unlanded', { params })
