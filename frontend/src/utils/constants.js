/**
 * 省级综合交通运输信息平台 - 常量定义
 */

// 路况状态
export const ROAD_STATUS = {
  SMOOTH: { label: '畅通', color: '#52c41a' },
  SLOW: { label: '缓行', color: '#faad14' },
  CONGESTED: { label: '拥堵', color: '#ff7a45' },
  BLOCKED: { label: '严重拥堵', color: '#f5222d' },
};

// 预警级别
export const WARNING_LEVELS = {
  BLUE: { label: '蓝色预警', color: '#1890ff', bg: '#e6f7ff' },
  YELLOW: { label: '黄色预警', color: '#faad14', bg: '#fffbe6' },
  ORANGE: { label: '橙色预警', color: '#fa8c16', bg: '#fff7e6' },
  RED: { label: '红色预警', color: '#f5222d', bg: '#fff1f0' },
};

// 事件级别
export const EVENT_LEVELS = {
  NORMAL: { label: '一般', color: '#1890ff' },
  MAJOR: { label: '较大', color: '#faad14' },
  SERIOUS: { label: '重大', color: '#fa8c16' },
  CRITICAL: { label: '特大', color: '#f5222d' },
};

// 应急预案级别
export const PLAN_LEVELS = {
  'I': { label: 'I级(特别重大)', color: '#f5222d' },
  'II': { label: 'II级(重大)', color: '#fa8c16' },
  'III': { label: 'III级(较大)', color: '#faad14' },
  'IV': { label: 'IV级(一般)', color: '#1890ff' },
};

// 设施状态
export const FACILITY_STATUS = {
  EXCELLENT: { label: '优良', color: '#52c41a' },
  GOOD: { label: '良好', color: '#1890ff' },
  AVERAGE: { label: '一般', color: '#faad14' },
  POOR: { label: '较差', color: '#f5222d' },
};

// 设施类型
export const FACILITY_TYPES = {
  BRIDGE: { label: '桥梁', icon: '🌉' },
  TUNNEL: { label: '隧道', icon: '🚇' },
  TOLL_STATION: { label: '收费站', icon: '🚧' },
  SERVICE_AREA: { label: '服务区', icon: '⛽' },
  MONITORING_CENTER: { label: '监控中心', icon: '📡' },
};

// 应急资源类型
export const RESOURCE_TYPES = {
  RESCUE_VEHICLE: { label: '救援车辆', icon: '🚗' },
  FIRE_TRUCK: { label: '消防车', icon: '🚒' },
  AMBULANCE: { label: '救护车', icon: '🚑' },
  TOW_TRUCK: { label: '清障车', icon: '🚛' },
  PATROL_CAR: { label: '巡逻车', icon: '🚓' },
  COMMAND_VEHICLE: { label: '指挥车', icon: '🚐' },
};

// 救援类型
export const RESCUE_TYPES = {
  BREAKDOWN: { label: '车辆故障', icon: '🔧' },
  FLAT_TIRE: { label: '轮胎漏气', icon: '⭕' },
  FUEL_EMPTY: { label: '燃油耗尽', icon: '⛽' },
  ACCIDENT: { label: '事故救援', icon: '🚨' },
  BATTERY: { label: '电瓶没电', icon: '🔋' },
};

// 天气图标
export const WEATHER_ICONS = {
  '晴': '☀️',
  '多云': '⛅',
  '阴': '☁️',
  '小雨': '🌧️',
  '中雨': '🌧️',
  '大雨': '⛈️',
  '雾': '🌫️',
  '雪': '❄️',
};

// 报表类型
export const REPORT_TYPES = {
  DAILY: { label: '日报', value: 'daily' },
  WEEKLY: { label: '周报', value: 'weekly' },
  MONTHLY: { label: '月报', value: 'monthly' },
};
