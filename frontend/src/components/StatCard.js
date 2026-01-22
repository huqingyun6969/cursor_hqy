/**
 * 统计卡片组件
 */
import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

const StatCard = ({ 
  title, 
  value, 
  prefix, 
  suffix,
  trend, 
  trendValue,
  icon,
  color = '#1890ff',
  loading = false,
  style = {}
}) => {
  const renderTrend = () => {
    // 始终渲染趋势区域，保持高度一致
    if (trendValue === undefined || trendValue === null) {
      // 没有趋势数据时显示占位，保持高度一致
      return (
        <div style={{ height: 22, marginTop: 8 }}>
          <Text style={{ fontSize: 12, visibility: 'hidden' }}>占位</Text>
        </div>
      );
    }
    
    const isUp = trendValue > 0;
    const trendColor = trend === 'positive' 
      ? (isUp ? '#52c41a' : '#f5222d')
      : (isUp ? '#f5222d' : '#52c41a');
    
    return (
      <div style={{ height: 22, marginTop: 8 }}>
        <Text style={{ color: trendColor, fontSize: 12 }}>
          {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {' '}{Math.abs(trendValue)}%
          <Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
            较昨日
          </Text>
        </Text>
      </div>
    );
  };

  return (
    <Card 
      loading={loading}
      style={{ 
        borderRadius: 4,
        height: '100%',
        ...style
      }}
      bodyStyle={{ padding: 20 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ 
              color: color,
              fontSize: 28,
              fontWeight: 600,
              marginTop: 4
            }}
          />
          {renderTrend()}
        </div>
        {icon && (
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: color,
            flexShrink: 0,
            marginLeft: 12
          }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
