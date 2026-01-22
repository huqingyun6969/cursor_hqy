/**
 * 省级综合交通运输信息平台 - API服务
 * 封装所有后端接口调用
 */
import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    // 如果后端不可用，返回模拟数据
    return {
      code: 200,
      message: 'mock data',
      data: null,
    };
  }
);

// ==================== 交通运行预警预测子系统 API ====================

export const trafficApi = {
  // 获取交通态势概览
  getOverview: () => api.get('/traffic-warning/overview/'),
  
  // 获取车流量预测
  getFlowPrediction: (params) => api.get('/traffic-warning/flow-prediction/', { params }),
  
  // 获取路网拥堵状态
  getCongestion: () => api.get('/traffic-warning/congestion/'),
  
  // 获取预警规则列表
  getWarningRules: () => api.get('/traffic-warning/rules/'),
  
  // 创建预警规则
  createWarningRule: (data) => api.post('/traffic-warning/rules/', data),
  
  // 更新预警规则
  updateWarningRule: (id, data) => api.put(`/traffic-warning/rules/${id}/`, data),
  
  // 获取预警信息列表
  getWarnings: (params) => api.get('/traffic-warning/warnings/', { params }),
  
  // 获取运行报表
  getReport: (params) => api.get('/traffic-warning/report/', { params }),
  
  // 生成报表
  generateReport: (data) => api.post('/traffic-warning/report/generate/', data),
  
  // 获取地图数据
  getMapData: () => api.get('/traffic-warning/map-data/'),
};

// ==================== 应急指挥调度管理子系统 API ====================

export const emergencyApi = {
  // 获取应急概览
  getOverview: () => api.get('/emergency/overview/'),
  
  // 获取应急资源
  getResources: (params) => api.get('/emergency/resources/', { params }),
  
  // 获取资源地图数据
  getResourcesMap: () => api.get('/emergency/resources/', { params: { view: 'map' } }),
  
  // 获取应急预案列表
  getPlans: () => api.get('/emergency/plans/'),
  
  // 获取预案详情
  getPlanDetail: (id) => api.get(`/emergency/plans/${id}/`),
  
  // 调取预案
  invokePlan: (data) => api.post('/emergency/plans/invoke/', data),
  
  // 获取事件列表
  getEvents: (params) => api.get('/emergency/events/', { params }),
  
  // 获取事件详情
  getEventDetail: (id) => api.get(`/emergency/events/${id}/`),
  
  // 上报事件
  reportEvent: (data) => api.post('/emergency/events/', data),
  
  // 调度事件
  dispatchEvent: (id, data) => api.put(`/emergency/events/${id}/dispatch/`, data),
  
  // 完成事件
  completeEvent: (id, data) => api.put(`/emergency/events/${id}/complete/`, data),
  
  // 复盘事件
  reviewEvent: (id, data) => api.put(`/emergency/events/${id}/review/`, data),
  
  // 获取值班排班
  getDutySchedule: (params) => api.get('/emergency/duty/', { params }),
  
  // 创建排班
  createDutySchedule: (data) => api.post('/emergency/duty/', data),
  
  // 分级叫应
  dispatchCall: (data) => api.post('/emergency/dispatch/call/', data),
};

// ==================== 基础设施监测预警子系统 API ====================

export const infrastructureApi = {
  // 获取驾驶舱数据
  getDashboard: () => api.get('/infrastructure/dashboard/'),
  
  // 获取设施列表
  getFacilities: (params) => api.get('/infrastructure/facilities/', { params }),
  
  // 获取设施详情
  getFacilityDetail: (id) => api.get(`/infrastructure/facilities/${id}/`),
  
  // 获取实时监测数据
  getMonitoringData: (facilityId) => api.get(`/infrastructure/monitoring/${facilityId}/`),
  
  // 移动端查询
  mobileQuery: (params) => api.get('/infrastructure/mobile/query/', { params }),
  
  // 扫码查询
  scanQuery: (data) => api.post('/infrastructure/mobile/query/', data),
  
  // 获取故障报警列表
  getAlerts: (params) => api.get('/infrastructure/alerts/', { params }),
  
  // 处理报警
  handleAlert: (id, data) => api.put(`/infrastructure/alerts/${id}/handle/`, data),
  
  // 获取设施地图数据
  getMapData: () => api.get('/infrastructure/map/'),
};

// ==================== 一张网出行服务子系统 API ====================

export const travelApi = {
  // 获取出行地图数据
  getMapData: (params) => api.get('/travel/map/', { params }),
  
  // 获取路况信息
  getRoadCondition: (params) => api.get('/travel/road-condition/', { params }),
  
  // 获取气象信息
  getWeather: () => api.get('/travel/weather/'),
  
  // 获取服务区列表
  getServiceAreas: (params) => api.get('/travel/service-areas/', { params }),
  
  // 获取服务区详情
  getServiceAreaDetail: (id) => api.get(`/travel/service-areas/${id}/`),
  
  // 获取预约列表
  getReservations: (params) => api.get('/travel/reservations/', { params }),
  
  // 创建预约
  createReservation: (data) => api.post('/travel/reservations/', data),
  
  // 取消预约
  cancelReservation: (id, data) => api.put(`/travel/reservations/${id}/cancel/`, data),
  
  // 获取救援记录
  getRescueRequests: () => api.get('/travel/rescue/'),
  
  // 发起救援
  createRescue: (data) => api.post('/travel/rescue/', data),
  
  // 查询救援状态
  getRescueStatus: (id) => api.get(`/travel/rescue/${id}/status/`),
  
  // 获取交旅融合推荐
  getRecommendations: (params) => api.get('/travel/recommendations/', { params }),
  
  // 获取推荐详情
  getRecommendationDetail: (id) => api.get(`/travel/recommendations/${id}/`),
  
  // POI搜索
  searchPOI: (params) => api.get('/travel/poi/search/', { params }),
};

export default api;
