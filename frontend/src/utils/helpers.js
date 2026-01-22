/**
 * 省级综合交通运输信息平台 - 工具函数
 */

/**
 * 格式化数字（添加千分位）
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 格式化百分比
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
};

/**
 * 获取状态标签颜色
 */
export const getStatusColor = (status) => {
  const colorMap = {
    '畅通': '#52c41a',
    '缓行': '#faad14',
    '拥堵': '#ff7a45',
    '严重拥堵': '#f5222d',
    '待处理': '#1890ff',
    '处理中': '#faad14',
    '已处理': '#52c41a',
    '已完成': '#52c41a',
    '待命': '#52c41a',
    '执行中': '#1890ff',
    '维护中': '#faad14',
    '在线': '#52c41a',
    '离线': '#f5222d',
    '优良': '#52c41a',
    '良好': '#1890ff',
    '一般': '#faad14',
    '较差': '#f5222d',
  };
  return colorMap[status] || '#8c8c8c';
};

/**
 * 获取预警级别配置
 */
export const getWarningLevelConfig = (level) => {
  const config = {
    '蓝色': { color: '#1890ff', bg: '#e6f7ff' },
    '黄色': { color: '#faad14', bg: '#fffbe6' },
    '橙色': { color: '#fa8c16', bg: '#fff7e6' },
    '红色': { color: '#f5222d', bg: '#fff1f0' },
  };
  return config[level] || { color: '#8c8c8c', bg: '#fafafa' };
};

/**
 * 计算时间差（返回"x分钟前"格式）
 */
export const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
  return dateStr.split(' ')[0];
};

/**
 * 生成随机ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * 深拷贝对象
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 防抖函数
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 节流函数
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * 下载文件
 */
export const downloadFile = (data, filename, type = 'application/json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
