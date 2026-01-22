/**
 * 状态标签组件
 */
import React from 'react';
import { Tag } from 'antd';
import { getStatusColor, getWarningLevelConfig } from '../utils/helpers';

// 通用状态标签
export const StatusTag = ({ status, style = {} }) => {
  const color = getStatusColor(status);
  return (
    <Tag color={color} style={style}>
      {status}
    </Tag>
  );
};

// 预警级别标签
export const WarningLevelTag = ({ level, style = {} }) => {
  const config = getWarningLevelConfig(level);
  return (
    <Tag 
      style={{ 
        color: config.color, 
        background: config.bg, 
        border: `1px solid ${config.color}`,
        ...style 
      }}
    >
      {level}预警
    </Tag>
  );
};

// 路况状态标签
export const RoadStatusTag = ({ status, style = {} }) => {
  const colorMap = {
    '畅通': { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
    '缓行': { color: '#faad14', bg: '#fffbe6', border: '#ffe58f' },
    '拥堵': { color: '#ff7a45', bg: '#fff2e8', border: '#ffbb96' },
    '严重拥堵': { color: '#f5222d', bg: '#fff1f0', border: '#ffa39e' },
    '管制': { color: '#722ed1', bg: '#f9f0ff', border: '#d3adf7' },
  };
  const config = colorMap[status] || { color: '#8c8c8c', bg: '#fafafa', border: '#d9d9d9' };
  
  return (
    <Tag 
      style={{ 
        color: config.color, 
        background: config.bg, 
        border: `1px solid ${config.border}`,
        ...style 
      }}
    >
      {status}
    </Tag>
  );
};

// 事件级别标签
export const EventLevelTag = ({ level, style = {} }) => {
  const colorMap = {
    '一般': { color: '#1890ff', bg: '#e6f7ff' },
    '较大': { color: '#faad14', bg: '#fffbe6' },
    '重大': { color: '#fa8c16', bg: '#fff7e6' },
    '特大': { color: '#f5222d', bg: '#fff1f0' },
  };
  const config = colorMap[level] || { color: '#8c8c8c', bg: '#fafafa' };
  
  return (
    <Tag 
      style={{ 
        color: config.color, 
        background: config.bg, 
        border: `1px solid ${config.color}40`,
        ...style 
      }}
    >
      {level}
    </Tag>
  );
};

// 预案级别标签
export const PlanLevelTag = ({ level, style = {} }) => {
  const colorMap = {
    'I级': { color: '#f5222d', bg: '#fff1f0' },
    'II级': { color: '#fa8c16', bg: '#fff7e6' },
    'III级': { color: '#faad14', bg: '#fffbe6' },
    'IV级': { color: '#1890ff', bg: '#e6f7ff' },
  };
  const config = colorMap[level] || { color: '#8c8c8c', bg: '#fafafa' };
  
  return (
    <Tag 
      style={{ 
        color: config.color, 
        background: config.bg, 
        border: `1px solid ${config.color}40`,
        fontWeight: 500,
        ...style 
      }}
    >
      {level}
    </Tag>
  );
};

export default StatusTag;
